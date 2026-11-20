# CKO Base Template Spec (Reference: Dipirona/Medication)

## SHARED MODULES (must be IDENTICAL structure across ALL resource types)

### Top-level
- `resourceType`: string (varies: Medication, Microorganism, LaboratoryTest, Procedure, Anatomy, Vaccine, ClinicalDevice)
- `id`: string (format: CKO-XXX-NNNNNN)
- `version`: string (semver: "1.0.0")

### identity
```json
{
  "name": "",
  "genericName": "",
  "brandNames": [],
  "synonyms": [],
  "slug": "",
  "description": ""
}
```

### classification
Varies per domain but follows same nested-object pattern.

### clinical
```json
{
  "indications": [],
  "offLabel": [],
  "clinicalUse": [],
  "firstLine": true
}
```

### related
```json
{
  "calculators": [],
  "clinicalScales": [],
  "procedures": [],
  "catheters": [],
  "needles": [],
  "syringes": [],
  "dressings": [],
  "wounds": [],
  "protocols": [],
  "articles": [],
  "videos": [],
  "courses": [],
  "flashcards": [],
  "checklists": [],
  "cases": []
}
```

### assets
```json
{
  "hero": { "url": "", "alt": "" },
  "gallery": [{ "url": "", "alt": "" }],
  "technical": [{ "url": "", "alt": "" }],
  "package": [{ "url": "", "alt": "" }],
  "presentation": [],
  "illustrations": [],
  "infographics": [],
  "videos": [],
  "documents": [],
  "icons": []
}
```

### accessibility
```json
{
  "alt": "",
  "longDescription": "",
  "captions": [],
  "screenReaderSummary": "",
  "highContrast": true,
  "colorBlindSafe": true
}
```

### sustainability
```json
{
  "disposal": "",
  "recycling": "",
  "environmentalRisk": "",
  "packagingMaterial": "",
  "carbonFootprint": { "estimatedKgCO2e": 0, "method": "" }
}
```

### transparency
```json
{
  "lastMedicalReview": "",
  "lastScientificReview": "",
  "evidenceLevel": "",
  "editorConflictOfInterest": "",
  "sourcesVerified": true
}
```

### knowledge
```json
{
  "clinicalPearls": [],
  "nursingCare": [],
  "patientEducation": [],
  "frequentlyAskedQuestions": [{ "question": "", "answer": "" }],
  "clinicalCases": [{ "title": "", "description": "" }]
}
```

### references
```json
{
  "guidelines": [{ "title": "", "url": "" }],
  "articles": [{ "title": "", "journal": "", "year": 0, "doi": "" }],
  "manufacturer": [{ "title": "", "url": "" }]
}
```

### search
```json
{
  "aliases": [],
  "abbreviations": [],
  "commonMisspellings": [],
  "phonetics": [],
  "keywords": [],
  "semanticTags": []
}
```

### analytics
```json
{ "views": 0, "favorites": 0, "shares": 0, "downloads": 0, "searchRank": 0 }
```

### favoriteResources
Array of strings.

### computed
```json
{ "readingTime": 0, "complexity": "", "riskLevel": "", "clinicalPriority": "" }
```

### metadata
```json
{
  "language": "pt-BR",
  "difficulty": "",
  "seo": { "title": "", "description": "", "keywords": [] },
  "tags": []
}
```

### governance
```json
{
  "status": "Published",
  "reviewDate": "",
  "reviewedBy": "",
  "editor": "Equipe CKO",
  "license": "CC-BY 4.0",
  "approvalLevel": "Diretoria Clínica",
  "syncInfo": { "lastSync": "", "version": "", "source": "" }
}
```

### timeline
```json
{
  "registration": { "date": "", "authority": "", "processNumber": "" },
  "lastUpdate": "",
  "newEvidence": [{ "date": "", "source": "", "description": "" }],
  "versionHistory": [{ "version": "", "date": "", "changes": "" }]
}
```

### translations
```json
{
  "pt-BR": { "name": "", "description": "" },
  "en": { "name": "", "description": "" },
  "es": { "name": "", "description": "" }
}
```
