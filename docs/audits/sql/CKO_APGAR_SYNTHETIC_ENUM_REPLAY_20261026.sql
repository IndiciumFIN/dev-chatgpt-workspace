-- 243 synthetic Cartesian test inputs driven only by Supabase candidate field enums.
-- No patient data. This exercises arithmetic/domain only; no clinical scoring authorization.
-- No DML, no DDL, no stored executable expressions, no new persistence.
WITH RECURSIVE
fields AS (
 SELECT row_number() over(order by field_id)::bigint rn,field_id,field_name,enum_values,required_status,validation_completeness_status
 FROM cko_governance.md_tool_field_contract_v2_candidate
 WHERE tool_slug='apgar' AND field_id LIKE 'TF-CAND-APGAR-%'
),
walk AS (
 SELECT 0::bigint rn, 0::integer synthetic_total
 UNION ALL
 SELECT w.rn+1, w.synthetic_total + (choice.item->>'value')::integer
 FROM walk w JOIN fields f ON f.rn=w.rn+1
 CROSS JOIN LATERAL jsonb_array_elements(f.enum_values) choice(item)
),
score_domain AS (
 SELECT f.field_id, f.required_status,f.validation_completeness_status,
        array_agg((v.item->>'value')::integer ORDER BY (v.item->>'value')::integer) values_allowed
 FROM fields f CROSS JOIN LATERAL jsonb_array_elements(f.enum_values) v(item)
 GROUP BY f.field_id,f.required_status,f.validation_completeness_status
),
finished AS (SELECT synthetic_total FROM walk WHERE rn=(SELECT count(*) FROM fields))
SELECT (SELECT count(*) FROM fields) AS scoring_fields,
 (SELECT count(*) FROM score_domain WHERE values_allowed=ARRAY[0,1,2]::integer[] AND required_status='REQUIRED' AND validation_completeness_status='PASS_CONTRACT_COMPLETE') AS fields_with_012_domain,
 count(*) AS synthetic_combinations,
 min(synthetic_total) AS synthetic_min,
 max(synthetic_total) AS synthetic_max,
 count(DISTINCT synthetic_total) AS distinct_synthetic_totals,
 bool_and(synthetic_total BETWEEN 0 AND 10) AS sum_always_in_range,
 (SELECT NOT EXISTS (SELECT 1 FROM score_domain f WHERE 3=ANY(f.values_allowed))) AS invalid_choice_3_not_in_domain,
 (SELECT count(*)=5 FROM score_domain) AS all_five_required_present,
 CASE WHEN (SELECT count(*) FROM fields)=5
  AND (SELECT count(*) FROM score_domain WHERE values_allowed=ARRAY[0,1,2]::integer[] AND required_status='REQUIRED')=5
  AND count(*)=243 AND min(synthetic_total)=0 AND max(synthetic_total)=10
  THEN 'PASS_CANDIDATE_ENUM_ARITHMETIC_ONLY_NO_CLINICAL_AUTHORITY'
  ELSE 'FAIL_CANDIDATE_ENUM_ARITHMETIC' END as diagnostic,
 (SELECT coalesce(b.object_engine_ref,'<NULL>') FROM cko_governance.b6_clinical_train_v1_candidate b WHERE b.business_key='apgar') AS clinical_object_engine_ref,
 (SELECT b.clinical_review_status FROM cko_governance.b6_clinical_train_v1_candidate b WHERE b.business_key='apgar') AS clinical_approval
FROM finished;
