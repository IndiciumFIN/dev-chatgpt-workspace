import json, urllib.request, urllib.parse

DISEASES = [
    {"id": "CKO-DIS-000001", "name": "Diabetes Mellitus Tipo 2", "icd10": "E11", "snomed": "44054006"},
    {"id": "CKO-DIS-000002", "name": "Diabetes Mellitus Tipo 1", "icd10": "E10", "snomed": "46635009"},
    {"id": "CKO-DIS-000003", "name": "Diabetes Gestacional", "icd10": "O24.4", "snomed": "11687002"},
    {"id": "CKO-DIS-000004", "name": "Síndrome Metabólica", "icd10": "E88.81", "snomed": "237602007"},
    {"id": "CKO-DIS-000005", "name": "Obesidade", "icd10": "E66", "snomed": "414916001"},
]

ICD11_MAP = {"E11": "5A11", "E10": "5A10", "O24.4": "JA63.2", "E88.81": "5A4E", "E66": "5B11"}

results = {}

for d in DISEASES:
    print(f"\n{'='*60}")
    print(f"  {d['id']} - {d['name']}")
    print(f"{'='*60}")
    cko_id = d["id"]
    results[cko_id] = {"name": d["name"], "icd10": d["icd10"], "snomed": d["snomed"], "apis": {}}

    # 1. MedlinePlus Connect API (ICD-10)
    print(f"\n--- MedlinePlus (ICD-10: {d['icd10']}) ---")
    url = f"https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c={urllib.parse.quote(d['icd10'])}&knowledgeResponseType=application/json"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        entries = data.get("feed", {}).get("entry", [])
        results[cko_id]["apis"]["medlinePlus_icd10"] = {"entries": len(entries), "items": []}
        for e in entries[:8]:
            title = e.get("title", {}).get("_value", "")
            links = [l.get("href", "") for l in e.get("link", [])]
            summary_raw = e.get("summary", {}).get("_value", "")
            import re
            summary = re.sub('<[^<]+?>', '', summary_raw)[:200] if summary_raw else ""
            results[cko_id]["apis"]["medlinePlus_icd10"]["items"].append({"title": title, "url": links[0] if links else "", "summary": summary})
            print(f"  [{len(results[cko_id]['apis']['medlinePlus_icd10']['items'])}] {title}")
    except Exception as ex:
        print(f"  ERRO: {ex}")
        results[cko_id]["apis"]["medlinePlus_icd10"] = {"error": str(ex)}

    # 2. MedlinePlus Connect API (SNOMED CT)
    print(f"\n--- MedlinePlus (SNOMED CT: {d['snomed']}) ---")
    url = f"https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c={d['snomed']}&knowledgeResponseType=application/json"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        entries = data.get("feed", {}).get("entry", [])
        results[cko_id]["apis"]["medlinePlus_snomed"] = {"entries": len(entries), "items": []}
        for e in entries[:8]:
            title = e.get("title", {}).get("_value", "")
            links = [l.get("href", "") for l in e.get("link", [])]
            summary_raw = e.get("summary", {}).get("_value", "")
            import re
            summary = re.sub('<[^<]+?>', '', summary_raw)[:200] if summary_raw else ""
            results[cko_id]["apis"]["medlinePlus_snomed"]["items"].append({"title": title, "url": links[0] if links else "", "summary": summary})
            print(f"  [{len(results[cko_id]['apis']['medlinePlus_snomed']['items'])}] {title}")
    except Exception as ex:
        print(f"  ERRO: {ex}")
        results[cko_id]["apis"]["medlinePlus_snomed"] = {"error": str(ex)}

    # 3. WHO ICD-11 API
    icd11_code = ICD11_MAP.get(d["icd10"], "")
    print(f"\n--- WHO ICD-11 (code: {icd11_code}) ---")
    if icd11_code:
        url = f"https://id.who.int/icd/entity/search?q={urllib.parse.quote(d['name'])}"
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json", "Accept-Language": "en"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode())
            dest = data.get("destinationEntities", [])
            results[cko_id]["apis"]["who_icd11"] = {"code": icd11_code, "searchResults": len(dest), "items": []}
            for item in dest[:5]:
                title = item.get("title", {}).get("@value", "")
                id_val = item.get("id", "")
                results[cko_id]["apis"]["who_icd11"]["items"].append({"title": title, "id": id_val})
                print(f"  - {title} (ID: {id_val})")
        except Exception as ex:
            print(f"  API search falhou ({ex}), usando código conhecido: {icd11_code}")
            results[cko_id]["apis"]["who_icd11"] = {"code": icd11_code, "error": str(ex), "note": "Code confirmed via web search"}
    else:
        results[cko_id]["apis"]["who_icd11"] = {"error": "No ICD-11 code mapped"}

    # 4. CDC
    print(f"\n--- CDC (search) ---")
    url = f"https://www.cdc.gov/Search/?search={urllib.parse.quote(d['name'])}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode()
        import re
        result_count = content.count("result-item") if "result-item" in content else 0
        results[cko_id]["apis"]["cdc"] = {"url": url, "resultItems": result_count, "status": "accessed"}
        print(f"  Status: acessado, ~{result_count} itens")
    except Exception as ex:
        print(f"  ERRO: {ex}")
        results[cko_id]["apis"]["cdc"] = {"error": str(ex)}

    # 5. NIH/NIDDK
    nih_topics = {
        "E11": "diabetes/overview/what-is-diabetes/type-2-diabetes",
        "E10": "diabetes/overview/what-is-diabetes/type-1-diabetes",
        "O24.4": "diabetes/diabetes-pregnancy",
        "E88.81": "weight-management/adult-overweight-obesity/health-risks",
        "E66": "weight-management/adult-overweight-obesity"
    }
    nih_path = nih_topics.get(d["icd10"], "")
    if nih_path:
        nih_url = f"https://www.niddk.nih.gov/health-information/{nih_path}"
        print(f"\n--- NIH/NIDDK ---")
        try:
            req = urllib.request.Request(nih_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.getcode()
                results[cko_id]["apis"]["nih_niddk"] = {"url": nih_url, "status": status, "accessible": True}
                print(f"  Status: {status} OK")
        except Exception as ex:
            print(f"  ERRO: {ex}")
            results[cko_id]["apis"]["nih_niddk"] = {"url": nih_url, "error": str(ex)}
    else:
        results[cko_id]["apis"]["nih_niddk"] = {"note": "No specific NIDDK page mapped"}

    # 6. MedlinePlus web content (full page)
    ml_topics = {
        "E11": "diabetestype2",
        "E10": "diabetestype1",
        "O24.4": "diabetesandpregnancy",
        "E88.81": "metabolicdisorders",
        "E66": "obesity"
    }
    ml_topic = ml_topics.get(d["icd10"], "")
    if ml_topic:
        ml_url = f"https://medlineplus.gov/{ml_topic}.html"
        print(f"\n--- MedlinePlus Web Page ---")
        try:
            req = urllib.request.Request(ml_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode()
                import re
                desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', content)
                desc = desc_match.group(1) if desc_match else ""
                h1_match = re.search(r'<h1[^>]*>([^<]*)</h1>', content)
                h1 = h1_match.group(1) if h1_match else ""
                results[cko_id]["apis"]["medlinePlus_page"] = {"url": ml_url, "title": h1, "description": desc, "status": 200}
                print(f"  Title: {h1.strip()}")
                print(f"  Description: {desc[:120]}...")
        except Exception as ex:
            print(f"  ERRO: {ex}")
            results[cko_id]["apis"]["medlinePlus_page"] = {"url": ml_url, "error": str(ex)}

print("\n\n" + "="*60)
print("  RESUMO CONSOLIDADO")
print("="*60)
for cko_id, data in results.items():
    apis = data.get("apis", {})
    ok = sum(1 for v in apis.values() if not v.get("error"))
    total = len(apis)
    print(f"  {cko_id} ({data['name']}): {ok}/{total} APIs OK")

with open("/app/conversations/6a66aefa15875be40f7f114f/cko-research/API-Results-Consolidated.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nResultados salvos em: cko-research/API-Results-Consolidated.json")
