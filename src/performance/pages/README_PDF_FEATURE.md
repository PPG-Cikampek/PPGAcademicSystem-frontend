# PDF Download Feature - SubBranchPerformanceView

## Overview

This component now includes comprehensive PDF download functionality with two approaches:

### Primary Approach: HTML2PDF.js

-   **Library**: html2pdf.js (already installed)
-   **Method**: Converts the DOM element `#report` directly to PDF
-   **Features**:
    -   Captures visual elements including charts and styling
    -   Automatic filename generation with filters and date
    -   High-quality output with proper formatting
    -   Custom page breaks and layout optimization

### Fallback Approach: Browser Print

-   **Method**: Native browser print functionality
-   **Trigger**: Automatically offered if HTML2PDF fails
-   **Features**:
    -   Zero dependencies
    -   Uses browser's built-in PDF generation
    -   Print-optimized CSS styling

## Implementation Details

### Key Features

1. **Smart Filename Generation**:

    ```
    Laporan_Performa_{AcademicYear}_{Date}_{Period}_{Class}.pdf
    ```

2. **Conditional Button State**:

    - Disabled when no data is available
    - Shows helpful tooltip messages
    - Prevents PDF generation without applied filters

3. **Print-Optimized Styling**:

    - Dedicated CSS file for print/PDF styles
    - Hidden UI elements (buttons, navigation) in PDF
    - Proper page break handling
    - Enhanced table formatting

4. **Error Handling**:
    - Graceful fallback to browser print
    - User confirmation dialogs
    - Console error logging

### CSS Classes Added

-   `.no-print`: Hide elements in PDF/print mode
-   `.print-break`: Force page break before element
-   `.print-avoid-break`: Prevent page break inside element
-   `.pdf-generation`: Temporary class during PDF creation

### Usage

1. Apply filters to load data
2. Click "Print Laporan" button
3. PDF will be automatically generated and downloaded
4. If HTML2PDF fails, user will be prompted to use browser print

### Technical Notes

-   PDF generation waits for chart rendering completion
-   Temporary styling is applied during generation and cleaned up afterward
-   Both portrait A4 format with optimized margins
-   High-resolution output (scale: 2) for better quality

## Dependencies

-   `html2pdf.js`: Primary PDF generation
-   `date-fns`: Date formatting and localization
-   `lucide-react`: Icons (FileDown)

## Browser Compatibility

-   Modern browsers supporting HTML5 Canvas
-   Print functionality available in all browsers
-   PDF download works in Chrome, Firefox, Safari, Edge
