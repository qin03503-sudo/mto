# Outdated Status Flow

Calculation results become outdated when inputs change.

Inputs that should mark calculations outdated:

- Offer material price update
- Scope added or removed
- Line added, updated, or removed
- Part added, updated, or removed
- Part quantity changed
- MTO version changed for an editable offer

Expected UI behavior:

- Show an outdated label or warning.
- Highlight the `Calculate` action.
- Keep the previous result visible but clearly marked as stale.
