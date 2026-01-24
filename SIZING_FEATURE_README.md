# Product Sizing Feature

This feature adds detailed product sizing information to your storefront, including visual sizing diagrams and measurement overlays.

## Features

- **Category-based sizing diagrams**: Different product categories show appropriate measurement diagrams
- **Measurement overlays**: Product measurements are displayed on top of diagrams
- **Size charts**: Standard size charts for each category
- **Responsive design**: Works on both desktop and mobile
- **Metadata integration**: Uses Medusa's existing metadata system

## How It Works

### 1. Product Metadata Structure

Products need sizing metadata in the following format:

```json
{
  "metadata": {
    "sizing": {
      "measurements": {
        "chest": { "S": 36, "M": 38, "L": 40, "XL": 42 },
        "waist": { "S": 32, "M": 34, "L": 36, "XL": 38 },
        "length": { "S": 26, "M": 27, "L": 28, "XL": 29 },
        "shoulder": { "S": 16, "M": 17, "L": 18, "XL": 19 }
      },
      "fit": "regular",
      "material": "cotton",
      "care_instructions": "Machine wash cold"
    }
  }
}
```

### 2. Supported Categories

Currently supports these product categories:
- **Shirts**: T-shirt style diagram with chest, waist, length, shoulder measurements
- **Sweatshirts**: Same as shirts but with different default measurements
- **Pants**: Trousers diagram with waist, hip, length, inseam measurements

### 3. Adding Sizing to Products

#### Option 1: Via Medusa Admin Panel
1. Go to your Medusa admin panel
2. Edit a product
3. Add sizing metadata in the metadata field
4. Save the product

#### Option 2: Via API
```typescript
// Example API call to update product metadata
await medusa.admin.products.update(productId, {
  metadata: {
    sizing: {
      measurements: {
        chest: { S: 36, M: 38, L: 40, XL: 42 },
        waist: { S: 32, M: 34, L: 36, XL: 38 }
      }
    }
  }
})
```

### 4. Frontend Integration

The sizing feature automatically appears on product pages:
- **Desktop**: Size Guide link appears below the "Add to Bag" button
- **Mobile**: Size Guide link appears in the mobile actions modal

## Components

### SizingModal
- Main modal component that displays sizing information
- Automatically selects the appropriate diagram based on product category
- Shows measurement overlays and size charts

### SizeGuideLink
- Simple link component that triggers the sizing modal
- Integrated into both desktop and mobile product actions

### Sizing Diagrams
- SVG-based diagrams for different product types
- Responsive and scalable
- Measurement points are positioned using percentage-based coordinates

## Customization

### Adding New Categories

1. **Create a new diagram component** in `src/modules/common/icons/sizing-diagrams.tsx`
2. **Add a new template** in `src/lib/data/sizing-templates.ts`
3. **Update the sizing modal** to handle the new diagram type

Example template:
```typescript
{
  category: "Dresses",
  diagram_component: "DressDiagram",
  units: "cm",
  measurement_points: {
    bust: { x_percent: 50, y_percent: 30, offset_x: 0, offset_y: -10, label: "Bust" },
    waist: { x_percent: 50, y_percent: 50, offset_x: 0, offset_y: -10, label: "Waist" },
    length: { x_percent: 50, y_percent: 80, offset_x: 0, offset_y: 10, label: "Length" }
  },
  size_chart: {
    XS: { bust: 32, waist: 26, length: 35 },
    S: { bust: 34, waist: 28, length: 36 },
    M: { bust: 36, waist: 30, length: 37 }
  }
}
```

### Styling

- Diagrams use Tailwind CSS classes for styling
- Measurement overlays can be customized in the `renderMeasurementOverlays` function
- Modal styling follows the existing design system

## Testing

### Manual Testing
1. Navigate to a product page
2. Click the "Size Guide" link
3. Verify the correct diagram appears for the product category
4. Check that measurements are properly positioned
5. Test on both desktop and mobile

### Automated Testing
- Components include `data-testid` attributes for testing
- Test the modal opening/closing functionality
- Verify diagram selection based on product category

## Future Enhancements

- **Size recommendation tool**: Based on user measurements
- **International units**: Support for both cm and inches
- **More product types**: Additional diagrams for different categories
- **Interactive diagrams**: Clickable measurement points
- **Size comparison**: Compare measurements across different products

## Troubleshooting

### Common Issues

1. **No diagram appears**: Check that the product category matches a supported category
2. **Measurements not showing**: Verify the product has sizing metadata
3. **Modal not opening**: Check browser console for JavaScript errors
4. **Poor positioning**: Verify measurement point coordinates in the template

### Debug Mode

Add console logs to see what's happening:
```typescript
console.log('Product category:', productCategory)
console.log('Sizing template:', sizingTemplate)
console.log('Product measurements:', productMeasurements)
```

## Dependencies

- **@medusajs/ui**: For Button and other UI components
- **@headlessui/react**: For modal functionality
- **Tailwind CSS**: For styling
- **React**: For component framework

## Support

For issues or questions about this feature, check:
1. Product metadata structure
2. Category naming consistency
3. Browser console for errors
4. Network tab for API calls
