/**
 * strings.ts
 * Quản lý toàn bộ text tĩnh trong UI (Zero-String-Leak).
 * Tuyệt đối không hardcode string literal vào trong component UI.
 */
export const TEXT = {
  COMMON: {
    LOADING: 'Đang tải dữ liệu...',
    ERROR: 'Đã có lỗi xảy ra',
    RETRY: 'Thử lại',
    SAVE: 'Lưu',
    CANCEL: 'Hủy',
    CONFIRM: 'Xác nhận',
    SUCCESS: 'Thành công',
  },
  SERVICE: {
    LIST_TITLE: 'Gói dịch vụ của bạn',
    EMPTY_STATE: 'Bạn chưa tạo gói dịch vụ nào.',
    CREATE_NEW: 'Tạo gói mới',
    FORM_TITLE_ADD: 'Tạo Gói Dịch Vụ Mới',
    FORM_TITLE_EDIT: 'Sửa Gói Dịch Vụ',
    NAME_LABEL: 'Tên gói',
    NAME_PLACEHOLDER: 'VD: Tư vấn lộ trình Frontend 1-1',
    DESC_LABEL: 'Mô tả',
    DESC_PLACEHOLDER: 'Mô tả chi tiết những gì học viên sẽ nhận được',
    PRICE_LABEL: 'Giá (VND)',
    DURATION_LABEL: 'Thời lượng mỗi buổi (Phút)',
    CURRICULUM_SECTION: 'Giáo trình & Lộ trình học',
    ADD_SESSION: '+ Thêm buổi học',
    SESSION_TITLE_PLACEHOLDER: 'Tên buổi học (VD: Đánh giá năng lực)',
    SESSION_DESC_PLACEHOLDER: 'Nội dung chi tiết...',
    VALIDATION: {
      NAME_REQUIRED: 'Vui lòng nhập tên gói dịch vụ.',
      CURRICULUM_MIN: 'Giáo trình cần ít nhất 1 buổi học.',
      PRICE_MIN: 'Giá không hợp lệ.',
    },
    TOGGLE_SUCCESS: 'Đã cập nhật trạng thái gói.',
    SAVE_SUCCESS: 'Lưu gói dịch vụ thành công.',
  },
  BOOKING: {
    LIST_TITLE: 'Lịch hẹn của tôi',
    TOTAL_COUNT: 'tổng lịch hẹn',
    TAB_UPCOMING: 'Sắp tới',
    TAB_COMPLETED: 'Hoàn thành',
    TAB_CANCELLED: 'Đã hủy',
    EMPTY_UPCOMING: 'Không có lịch hẹn sắp tới nào.',
    EMPTY_COMPLETED: 'Chưa có lịch hẹn nào hoàn thành.',
    EMPTY_CANCELLED: 'Không có lịch hẹn đã hủy.',
    HEADER_DETAIL: 'Chi tiết Lịch hẹn',
    TIMELINE_TITLE: 'Lộ trình buổi học',
    BTN_JOIN: 'Vào họp',
    BTN_REVIEW: 'Đánh giá',
    BTN_COMPLETE: 'Đã xong',
    REVIEW_MODAL_TITLE: 'Đánh giá buổi học',
    REVIEW_SUBMIT: 'Gửi đánh giá',
    REVIEW_PLACEHOLDER: 'Chia sẻ cảm nhận của bạn...',
  },
  VALIDATION: {
    REQUIRED: 'Trường này không được để trống.',
  }
};
