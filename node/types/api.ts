/**
 * Normalized envelope returned by every service endpoint.
 * data always keeps its declared shape (empty array/object instead of null),
 * message feeds UI feedback such as toasts.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
