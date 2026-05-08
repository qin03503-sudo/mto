# Data Dictionary

This file should be expanded as tables are finalized.

Important fields:

| Field | Meaning |
| --- | --- |
| `is_overridden` | Indicates a project material price was changed from the copied default price. |
| `source_default_price` | Default material price copied when the offer was created. |
| `calculation_method` | Defines how an MTO row total is calculated. |
| `source_excel_row` | Original Excel row number used for traceability. |
| `calculation_status` | Indicates whether stored calculation values are current or outdated. |

## Proposed Tables (from PRD Section 10)

### projects
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| name | String |
| offer_number | String |
| type | String |
| input_date | Date |
| close_date | Date |
| status | String |
| created_by | User ID |
| created_at | DateTime |
| updated_at | DateTime |

### scopes
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| name | String |
| ampere | Number |
| material_type | Enum: AL, CU |
| is_active | Boolean |

### parts
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| name | String |
| description | Text |
| is_active | Boolean |

### materials
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| name | String |
| default_unit_price | Decimal |
| unit | String |
| dimension | String |
| is_active | Boolean |

### mto_master
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| scope_id | FK |
| part_id | FK |
| material_id | FK |
| quantity | Decimal |
| value | Decimal |
| unit | String |

### project_material_prices
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| project_id | FK |
| material_id | FK |
| unit_price | Decimal |
| unit | String |
| dimension | String |

### project_scopes
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| project_id | FK |
| scope_id | FK |

### lines
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| project_id | FK |
| scope_id | FK |
| name | String |
| description | Text |

### line_items
| Field | Type |
| --- | --- |
| id | UUID / Integer |
| line_id | FK |
| part_id | FK |
| quantity | Decimal |
| calculated_unit_price | Decimal |
| calculated_total_price | Decimal |
