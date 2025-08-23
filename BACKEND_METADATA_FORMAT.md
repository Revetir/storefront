# Backend Metadata Format for Sizing

## Issue Identified
Your console shows "sizing metadata found" but "Product measurements available: None" - this means your metadata has a `sizing` key but is missing the nested `measurements` structure.

## Backend Key-Value Format

For your backend's spreadsheet-style metadata (key | value), you need to create a single key that contains the entire JSON structure as a string value.

### Single Key-Value Entry

**Key:** `sizing`

**Value:** (Copy this exact JSON string)
```json
{"measurements":{"waist":{"S":30,"M":32,"L":34,"XL":36},"hip":{"S":34,"M":36,"L":38,"XL":40},"inseam":{"S":30,"M":31,"L":32,"XL":33},"hem":{"S":15,"M":16,"L":17,"XL":18}}}
```

## Step-by-Step Backend Entry

1. **Key Column:** `sizing`
2. **Value Column:** `{"measurements":{"waist":{"S":30,"M":32,"L":34,"XL":36},"hip":{"S":34,"M":36,"L":38,"XL":40},"inseam":{"S":30,"M":31,"L":32,"XL":33},"hem":{"S":15,"M":16,"L":17,"XL":18}}}`

## Alternative: Multiple Keys (if your backend supports it)

If your backend can handle multiple metadata keys, you could split it:

| Key | Value |
|-----|-------|
| `sizing.measurements.waist.S` | `30` |
| `sizing.measurements.waist.M` | `32` |
| `sizing.measurements.waist.L` | `34` |
| `sizing.measurements.waist.XL` | `36` |
| `sizing.measurements.hip.S` | `34` |
| `sizing.measurements.hip.M` | `36` |
| `sizing.measurements.hip.L` | `38` |
| `sizing.measurements.hip.XL` | `40` |
| `sizing.measurements.inseam.S` | `30` |
| `sizing.measurements.inseam.M` | `31` |
| `sizing.measurements.inseam.L` | `32` |
| `sizing.measurements.inseam.XL` | `33` |
| `sizing.measurements.hem.S` | `15` |
| `sizing.measurements.hem.M` | `16` |
| `sizing.measurements.hem.L` | `17` |
| `sizing.measurements.hem.XL` | `18` |

## Test Values for Different Categories

### Pants (use these exact measurement keys)
```json
{"measurements":{"waist":{"S":30,"M":32,"L":34,"XL":36},"hip":{"S":34,"M":36,"L":38,"XL":40},"inseam":{"S":30,"M":31,"L":32,"XL":33},"hem":{"S":15,"M":16,"L":17,"XL":18}}}
```

### Shirts
```json
{"measurements":{"chest":{"S":36,"M":38,"L":40,"XL":42},"waist":{"S":32,"M":34,"L":36,"XL":38},"length":{"S":26,"M":27,"L":28,"XL":29},"shoulder":{"S":16,"M":17,"L":18,"XL":19}}}
```

### Sweatshirts
```json
{"measurements":{"chest":{"S":38,"M":40,"L":42,"XL":44},"waist":{"S":34,"M":36,"L":38,"XL":40},"length":{"S":27,"M":28,"L":29,"XL":30},"shoulder":{"S":17,"M":18,"L":19,"XL":20}}}
```

### Necklaces
```json
{"measurements":{"length":{"50cm":50,"60cm":60,"70cm":70},"width":{"50cm":4,"60cm":4,"70cm":4},"link_length":{"50cm":2,"60cm":2,"70cm":2}}}

## Important Notes

1. **Exact Key Names**: The measurement keys must exactly match:
   - Pants: `waist`, `hip`, `inseam`, `hem`
   - Shirts/Sweatshirts: `chest`, `waist`, `length`, `shoulder`

2. **JSON Format**: The value must be valid JSON (use double quotes, not single quotes)

3. **Size Names**: Use exactly `S`, `M`, `L`, `XL` (case-sensitive)

4. **Numbers Only**: All measurement values should be numbers (no units in the JSON)

## Debugging
After adding this metadata, check your browser console when opening the size guide. You should see:
- "✅ Sizing metadata found: [your data]"
- "👕 Product measurements available: waist,hip,inseam,hem"
- Each measurement showing "(from product metadata)" instead of "(from template default)"
