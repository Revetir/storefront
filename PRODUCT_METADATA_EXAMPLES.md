# Product Metadata Structure for Sizing

## Overview
The sizing system expects product metadata in a specific JSON structure. The system will prioritize product-specific measurements over template defaults.

## Required Structure

```json
{
  "metadata": {
    "sizing": {
      "measurements": {
        "measurement_key": {
          "S": number,
          "M": number,
          "L": number,
          "XL": number
        }
      }
    }
  }
}
```

## Category-Specific Examples

### Pants Products
For pants, use these measurement keys that match the template:
- `waist` - Waist circumference
- `hip` - Hip/Rise measurement  
- `inseam` - Inseam length
- `hem` - Hem width

```json
{
  "metadata": {
    "sizing": {
      "measurements": {
        "waist": {
          "S": 30,
          "M": 32,
          "L": 34,
          "XL": 36
        },
        "hip": {
          "S": 34,
          "M": 36,
          "L": 38,
          "XL": 40
        },
        "inseam": {
          "S": 30,
          "M": 31,
          "L": 32,
          "XL": 33
        },
        "hem": {
          "S": 15,
          "M": 16,
          "L": 17,
          "XL": 18
        }
      }
    }
  }
}
```

### Shirts Products
For shirts, use these measurement keys:
- `chest` - Chest circumference
- `waist` - Waist circumference
- `length` - Total length
- `shoulder` - Shoulder width

```json
{
  "metadata": {
    "sizing": {
      "measurements": {
        "chest": {
          "S": 36,
          "M": 38,
          "L": 40,
          "XL": 42
        },
        "waist": {
          "S": 32,
          "M": 34,
          "L": 36,
          "XL": 38
        },
        "length": {
          "S": 26,
          "M": 27,
          "L": 28,
          "XL": 29
        },
        "shoulder": {
          "S": 16,
          "M": 17,
          "L": 18,
          "XL": 19
        }
      }
    }
  }
}
```

### Sweatshirts Products
Same keys as shirts:
- `chest`, `waist`, `length`, `shoulder`

```json
{
  "metadata": {
    "sizing": {
      "measurements": {
        "chest": {
          "S": 38,
          "M": 40,
          "L": 42,
          "XL": 44
        },
        "waist": {
          "S": 34,
          "M": 36,
          "L": 38,
          "XL": 40
        },
        "length": {
          "S": 27,
          "M": 28,
          "L": 29,
          "XL": 30
        },
        "shoulder": {
          "S": 17,
          "M": 18,
          "L": 19,
          "XL": 20
        }
      }
    }
  }
}
```

## Important Notes

1. **Measurement Keys Must Match**: The measurement keys in your product metadata must exactly match the `measurement_points` keys defined in the sizing template for that category.

2. **Size Keys Must Match**: The size keys (S, M, L, XL) must match what you want to display in the size selector.

3. **All Values in CM**: All measurements should be provided in centimeters. The system will automatically convert to inches when the user toggles units.

4. **Priority System**: 
   - If product has `metadata.sizing.measurements`, those values will be used
   - If no product metadata, template defaults will be shown
   - If a measurement key is missing from product metadata, that specific measurement will show "-"

## Debugging

To debug what's happening with your product metadata, check the browser console. The sizing modal will log:
- Product metadata structure
- Available measurements
- Selected size values

## Template Measurement Keys Reference

| Category | Measurement Keys |
|----------|------------------|
| Pants | `waist`, `hip`, `inseam`, `hem` |
| Shirts | `chest`, `waist`, `length`, `shoulder` |
| Sweatshirts | `chest`, `waist`, `length`, `shoulder` |
| Merch | `width`, `height` |
