# Công cụ mượn phòng

Mở **Mượn phòng** trên thanh điều hướng. Lịch tuần từ thứ 2 đến CN sử dụng múi giờ Việt Nam. Có thể lọc theo phòng và chuyển tuần. Giờ mở cửa: 07:00–20:00 thứ 2–6, 07:00–17:00 thứ 7 và CN.

## Cấu hình lần đầu

1. Với cơ sở dữ liệu workspace đã tồn tại, chạy `node scripts/local/migrate-rooms.js` trước khi khởi động phiên bản mới. `setup:local` cũng áp dụng cập nhật này và giữ dữ liệu hiện có.
2. Trong Admin Center → People & access, quản trị viên cấp vai trò **Faculty** trong team cho giảng viên. Thành viên team thông thường không tự có quyền này. Người dùng phải thuộc team đang hoạt động và có quyền `room.book` tương ứng.
3. Quản trị viên cấp vai trò **School office head** cho Trưởng VP Trường. Vai trò này có quyền cấu hình phòng và chỉ định cán bộ duyệt. Quản trị viên cũng có thể cấu hình phòng.
4. Trong **Mượn phòng → Thêm phòng**, nhập tên, vị trí và chọn tự động duyệt hoặc cán bộ chuyên trách. Phòng duyệt thủ công bắt buộc có cán bộ đang hoạt động. Chưa tạo sẵn phòng hoặc cấp quyền cho tài khoản thật vì cần dùng danh sách thực tế của Trường.

## Đăng ký và xử lý

- Chọn phòng, team, ngày, giờ bắt đầu/kết thúc; nhập chủ trì, nội dung và phân loại cuộc họp.
- Phòng chung tự duyệt khi không trùng giờ. Phòng đặc thù chuyển trạng thái chờ duyệt; cán bộ được chỉ định xử lý trong danh sách đăng ký của tuần tương ứng.
- Đăng ký chờ duyệt giữ khung giờ. Kiểm tra trùng thực hiện trong giao dịch, kể cả khi nhiều người đăng ký đồng thời. Hai lịch nối tiếp nhau được phép.
- Chỉ cán bộ hiện được chỉ định cho phòng được duyệt/từ chối; từ chối bắt buộc có lý do. Quyền faculty của người đăng ký được kiểm tra lại khi duyệt.
- Người đăng ký hoặc người quản lý phòng có thể hủy trước giờ bắt đầu. Lịch bị từ chối hoặc hủy được giữ trong lịch sử nhưng không chiếm giờ.
- Đổi cán bộ duyệt áp dụng cả yêu cầu đang chờ. Ngừng sử dụng phòng chặn đăng ký mới và duyệt mới, không tự hủy các lịch đã đăng ký; người quản lý cần xử lý những lịch đó.
- Mọi cấu hình, đăng ký và quyết định được ghi nhật ký. Các thành viên đủ quyền xem lịch thấy thông tin cuộc họp; không nhập nội dung cần bảo mật vào lịch dùng chung.

Kiểm tra: `npm.cmd run check`, `npm.cmd test`, `npm.cmd run test:ui`. Các bài kiểm tra tích hợp/trình duyệt dùng cơ sở dữ liệu thử nghiệm riêng theo quy trình trong LOCAL_TESTING.md.
