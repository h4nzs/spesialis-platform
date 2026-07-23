// ─── Primitives ─────────────────────────────────────────────────────────
export { Button, type ButtonProps } from './components/Button.tsx';
export { Input, type InputProps } from './components/Input.tsx';
export { Textarea, type TextareaProps } from './components/Textarea.tsx';
export { Select, type SelectProps, type SelectOption } from './components/Select.tsx';
export { Badge, type BadgeProps } from './components/Badge.tsx';
export { DatePicker, type DatePickerProps } from './components/DatePicker.tsx';
export { FileUpload, type FileUploadProps } from './components/FileUpload.tsx';

// ─── New Primitives ──────────────────────────────────────────────────────
export { Skeleton, type SkeletonProps } from './components/Skeleton.tsx';
export { Avatar, type AvatarProps } from './components/Avatar.tsx';
export { Switch, type SwitchProps } from './components/Switch.tsx';
export { Tooltip, type TooltipProps } from './components/Tooltip.tsx';
export { Divider, type DividerProps } from './components/Divider.tsx';

// ─── Layout ─────────────────────────────────────────────────────────────
export { Container } from './components/Container.tsx';
export { Section, type SectionProps } from './components/Section.tsx';
export { Stack, type StackProps } from './components/Stack.tsx';
export { Grid, type GridProps } from './components/Grid.tsx';
export { Flex, type FlexProps } from './components/Flex.tsx';

// ─── Data Display ───────────────────────────────────────────────────────
export { Card, type CardProps } from './components/Card.tsx';
export {
  Heading,
  Display,
  Text,
  type HeadingProps,
  type DisplayProps,
  type TextProps,
} from './components/Typography.tsx';
export { Table, type TableProps, type Column } from './components/Table.tsx';
export { Pagination, type PaginationProps } from './components/Pagination.tsx';

// ─── Feedback ────────────────────────────────────────────────────────────
export { Modal, type ModalProps } from './components/Modal.tsx';
export { Alert, type AlertProps } from './components/Alert.tsx';
export { Toast, type ToastProps } from './components/Toast.tsx';
export { Spinner, type SpinnerProps } from './components/Spinner.tsx';
export { EmptyState, type EmptyStateProps } from './components/EmptyState.tsx';
export { ConfirmDialog, type ConfirmDialogProps } from './components/ConfirmDialog.tsx';

// ─── Export Utilities ────────────────────────────────────────────────────
export {
  CSVExportButton,
  type CSVExportButtonProps,
  type CSVExportColumn,
} from './components/CSVExportButton.tsx';
export { TableSkeleton, type TableSkeletonProps } from './components/TableSkeleton.tsx';

// ─── Form Inputs ─────────────────────────────────────────────────────────
export { PasswordInput, type PasswordInputProps } from './components/PasswordInput.tsx';
export { SearchInput, type SearchInputProps } from './components/SearchInput.tsx';
export { PhoneInput, type PhoneInputProps } from './components/PhoneInput.tsx';
export { NumberInput, type NumberInputProps } from './components/NumberInput.tsx';
export { TimePicker, type TimePickerProps } from './components/TimePicker.tsx';

// ─── Media Browser ────────────────────────────────────────────
export { MediaBrowser, type MediaBrowserProps } from './components/MediaBrowser.tsx';

// ─── Tags Input ─────────────────────────────────────────────────
export { TagsInput, type TagsInputProps } from './components/TagsInput.tsx';

// ─── SEO Editor ─────────────────────────────────────────────────
export {
  SEOEditor,
  type SEOEditorProps,
  type SeoData,
  DEFAULT_SEO,
} from './components/SEOEditor.tsx';

// ─── Schema Builder ────────────────────────────────────────────
export { SchemaBuilder, type SchemaBuilderProps } from './components/SchemaBuilder.tsx';

// ─── SEO Analyzer ────────────────────────────────────────────
export { SeoScoreGauge, type SeoScoreGaugeProps } from './components/SeoScoreGauge.tsx';
export { SeoChecklist, type SeoChecklistProps } from './components/SeoChecklist.tsx';
export { SnippetPreview, type SnippetPreviewProps } from './components/SnippetPreview.tsx';
export { ReadabilityScore, type ReadabilityScoreProps } from './components/ReadabilityScore.tsx';
export { SeoAnalyzerPanel, type SeoAnalyzerPanelProps } from './components/SeoAnalyzerPanel.tsx';

// ─── Lock Badge ────────────────────────────────────────────────
export { LockBadge, type LockBadgeProps } from './components/LockBadge.tsx';

// ─── Content Lock Web Component ────────────────────────────────
export { defineContentLockWidget, ContentLockWidget } from './components/content-lock-widget.ts';
export type { LockStatus, LockState } from './components/content-lock-widget.ts';

// ─── Shared Lock Utilities ────────────────────────────────────
export {
  TAKEOVER_BUTTON_LABELS,
  TAKEOVER_BUTTON_ARIA,
  createTakeoverHandler,
} from './shared/takeover-button.ts';
export type { TakeoverAction, TakeoverLoadingState } from './shared/takeover-button.ts';

// ─── Utilities ──────────────────────────────────────────────────────────
export { cn } from './utils/cn.ts';
