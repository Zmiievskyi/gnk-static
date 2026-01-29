---
name: hubspot
description: Manage HubSpot form integration, modal behavior, and form pre-population. Use when modifying forms, updating modal styling, or changing pre-population logic.
---

# HubSpot Modal Integration

## Configuration

```javascript
const HUBSPOT_CONFIG = {
  portalId: '147554099',
  formId: '78fd550b-eec3-4958-bc4d-52c73924b87b',
  region: 'eu1',
  fieldName: 'form_gonka_preffered_configuration',
  scriptTimeout: 10000,
};
```

## Open Modal

```javascript
// Basic
openHubSpotModal();

// With GPU pre-selection
openHubSpotModal('H100');
```

From HTML:
```html
<button onclick="openHubSpotModal('A100')">Rent A100</button>
```

## Modal Lifecycle

1. **Open** → `modal.showModal()`, set URL param `?gpu=H100`
2. **Load Script** → Show spinner, load HubSpot embed
3. **Render Form** → Pre-populate GPU field from URL param
4. **Submit** → Close modal after 2 seconds
5. **Close** → Remove URL param, restore body scroll

## Pre-Population

GPU type passed via URL parameter:
```
https://minegnk.com/?gpu=H100
```

Form reads param in `onFormReady`:
```javascript
onFormReady: function($form) {
  const gpu = new URLSearchParams(location.search).get('gpu');
  if (gpu) {
    $form.find(`input[name="${HUBSPOT_CONFIG.fieldName}"]`).val(gpu);
  }
}
```

## Change Form Field

Update `fieldName` in config to match HubSpot form's internal field name.

## Change Region

EU → NA:
```javascript
region: 'na1',
// Also update script URL:
script.src = 'https://js.hsforms.net/forms/embed/v2.js';
```

## Error States

Script timeout or load failure shows error with refresh button:
```javascript
function showError(message) {
  modalBody.innerHTML = `
    <div class="error-state">
      <p>${message}</p>
      <button onclick="location.reload()">Refresh</button>
    </div>
  `;
}
```

## Testing

1. Click each "Rent Now" button
2. Verify modal opens with correct GPU
3. Check URL parameter is set
4. Submit test form
5. Verify modal closes after submission
6. Test Escape key and backdrop click

## Related Files

- `js/hubspot-modal.js` - Modal logic
- `index.html` - `<dialog>` element
- `css/styles.css` - Modal styling
