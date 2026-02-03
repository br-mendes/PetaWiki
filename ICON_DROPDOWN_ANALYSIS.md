# Icon Dropdown Analysis for AdminSettings.tsx

## Issue Description
The user wants icon dropdowns in AdminSettings.tsx to display actual icons instead of text names like "shield", "users", "search", "book", etc.

## Current Implementation Analysis

### 1. Hero Tags Section
**Location**: `AdminSettings.tsx:620-626`
```tsx
<select
    value={tag.icon}
    onChange={(e) => handleUpdateHeroTag(idx, 'icon', e.target.value)}
    className="w-32 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
>
    {AVAILABLE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
</select>
```
- **Status**: Shows only text icon names
- **Issue**: No icon preview available

### 2. Landing Features Section
**Location**: `AdminSettings.tsx:658-667`
```tsx
<select
    value={feat.icon}
    onChange={(e) => handleUpdateFeature(idx, 'icon', e.target.value)}
    className="w-24 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-gray-50 dark:bg-gray-800"
>
    {AVAILABLE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
</select>
<div className="mt-2 flex justify-center text-blue-600 dark:text-blue-400">
    <IconRenderer iconName={feat.icon} size={24} />
</div>
```
- **Status**: Shows only text icon names in dropdown
- **Working**: Already has IconRenderer preview below dropdown (line 666)

### 3. IconRenderer Component
**Location**: `IconRenderer.tsx:11-40`
- **Available Icons**: `life-buoy`, `server`, `message-circle`, `mail`, `monitor`, `users`, `user-plus`, `heart`, `folder`, `book`, `library`, `shield`, `search`, `lock`, `zap`, `globe`, `layout`, `star`, `help-circle`, `calendar`, `clipboard-list`, `scale`, `file-text`
- **Import**: Already imported in AdminSettings.tsx:13
- **Usage**: Currently only used for preview in Landing Features

## Recommendations

### Option 1: Add IconRenderer Previews to Hero Tags
Add similar preview like Landing Features:
```tsx
<div className="ml-2 flex items-center">
    <IconRenderer iconName={tag.icon} size={20} />
</div>
```

### Option 2: Create Custom Icon Dropdown Component
Replace HTML select with custom dropdown that shows icons in options

### Option 3: Use Select with Icons in Options
Create a custom select component that renders icons alongside text in options

## Next Steps
1. Decide on preferred implementation approach
2. Implement the chosen solution
3. Test with all available icons
4. Ensure dark mode compatibility