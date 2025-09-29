// Use units of 100 to easily manage and increment related z-index within a component
// https://dev.to/mimafogeus2/a-better-way-to-manage-z-indexes-1nf
// TODO MG: file name should follow standard of kebob case
export enum zIndexOrder {
    CardLinkClickArea = 100,
    CardPopoverTrigger = 200,
    DatePickerDialog = 600,
    Overlay = 300,
    Popover = 400,
    Dialog = 500,
}
