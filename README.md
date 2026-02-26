MINI DATING APP PROTOTYPE
Giới thiệu

Đây là một Mini Dating App đơn giản được xây dựng nhằm mô phỏng quy trình:

Người dùng tạo profile

Like người khác

Khi hai người like nhau và tạo Match

Hai người chọn khung giờ rảnh

Hệ thống tự động tìm thời gian trùng nhau và xác nhận lịch hẹn

Mục tiêu của bài làm là tập trung vào xử lý logic backend và quản lý dữ liệu, đồng thời có giao diện cơ bản để demo đầy đủ flow.
/================================================/
Công nghệ sử dụng
Frontend: Next.js (App Router)
Backend: API Routes (Next.js)
Database: MongoDB
ODM: Mongoose
Validation: Zod
Form Handling: React Hook Form
/================================================/
Cấu trúc project
/app
/api
/match
/dashboard
/profiles
/models
/controllers
/lib
/validations

models/ Định nghĩa schema (User, Like, Match, Availability)

controllers/ Xử lý logic chính

api/ Nhận request từ client

lib/mongoose.ts Kết nối MongoDB

validations/ Validate dữ liệu đầu vào
/================================================/
Database Design:
/==============/
1/ User
Lưu thông tin người dùng:
name
age
gender
bio
email 
/==============/
2/ Like

Lưu hành động thích:
from
to
Dùng để kiểm tra mutual like.
/==============/
3/ Match

Được tạo khi hai người like nhau.
users (2 người)
status: pending | confirmed
dateConfirmed:
date
from
to
/==============/
4/ Availability

Lưu các khung giờ người dùng chọn trong một match.
userId
matchId
date
from
to
/================================================/
Logic hoạt động
/==============/
Bước 1: Like

Khi user A like user B:
Không cho like chính mình
Không cho like trùng
Kiểm tra xem B đã like A chưa
Nếu có mutual like:
Kiểm tra đã tồn tại match chưa
Nếu chưa match tạo match với status = pending
/==============/
Bước 2: Chọn khung giờ

Mỗi user có thể:
Chọn tối đa 2 khung giờ
Không được chọn khung giờ trùng với chính mình
Không được trùng lịch với match khác đã confirmed
/==============/
Bước 3: Tìm thời gian trùng

Sau khi lưu slot:
Lấy toàn bộ availability của match
Tách theo từng user
So sánh từng cặp slot
Điều kiện trùng:
A.from < B.to && B.from < A.to
Và phải cùng ngày.
Nếu tìm được phần giao nhau:
Kiểm tra lại conflict với match khác
Nếu hợp lệ:
Cập nhật match => status = confirmed
Lưu dateConfirmed
/================================================/
Frontend

Frontend được xây dựng đơn giản để demo flow đầy đủ.
Các trang chính
/==============/
Home

Tạo profile mới
Xem danh sách profile
/==============/
Create Profile

Form nhập thông tin
Validate bằng Zod
Hiển thị lỗi nếu nhập sai
Sau khi tạo thành công => lưu currentUserId vào localStorage
/==============/
Profiles

Hiển thị danh sách user
Cho phép login giả lập bằng cách chọn user
/==============/
Dashboard

Hiển thị danh sách user khác
Có nút Like
Nếu mutual => chuyển sang trang Match
Có xử lý:
Loading state
Disable button khi đang gửi request
/==============/
Match

Nếu pending => hiển thị thông báo match thành công
Nếu confirmed => hiển thị lịch hẹn
/==============/
Availability

Chọn ngày
Chọn giờ bắt đầu - kết thúc
Polling 5 giây để cập nhật nếu đối phương chọn giờ
/==============/
Các edge cases đã xử lý
Không like chính mình
Không like trùng
Không tạo match trùng
Không confirm 2 lần
Giới hạn 2 slot mỗi user
Validate email khi tạo user
Không cho chọn giờ kết thúc nhỏ hơn giờ bắt đầu
/================================================/
Nếu có thêm thời gian phát triển, em sẽ cải thiện và bổ sung một số tính năng sau:
1/ Thêm hệ thống Authentication (Đăng nhập thật)
Hiện tại em đang dùng localStorage để giả lập đăng nhập.
Nếu có thời gian, em sẽ:
Thêm đăng ký / đăng nhập bằng email + password
Hash password bằng bcrypt
Sử dụng JWT hoặc NextAuth để quản lý session
Lý do:
Giúp hệ thống an toàn hơn
Mô phỏng gần với ứng dụng thực tế
Tránh việc người dùng có thể tự chỉnh sửa localStorage
2/ Thêm tính năng Chat sau khi Match được Confirm
Sau khi hai người đã xác nhận lịch hẹn, em sẽ:
Cho phép họ nhắn tin với nhau
Chỉ mở chat khi match đã confirmed
Lý do:
Tăng tương tác giữa người dùng
Giúp ứng dụng giống sản phẩm thực tế hơn
