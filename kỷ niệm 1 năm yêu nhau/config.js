// ============================================================
// ✏️  FILE NÀY CHỨA TẤT CẢ THÔNG TIN BẠN CẦN CHỈNH SỬA
// ============================================================

// 🔐 Mật khẩu 4 số để vào trang
const SECRET_CODE = '1905';

// 📅 Ngày bắt đầu yêu nhau (định dạng: YYYY-MM-DDTHH:mm:ss)
const START_DATE = new Date('2025-05-19T00:00:00');

// ⏱️ Thời gian đếm ngược trên màn hình galaxy (giây)
const TIMER_TOTAL = 20;

// 💌 Nội dung bức thư tình
const LETTER_TEXT = `Chồn yêu dấu của thúi,

Một năm qua, mỗi ngày bên thúi là một ngày chồn biết ơn cuộc đời đã cho mình gặp nhau. Từ những buổi sáng bắt đầu bằng tin nhắn dễ thương và những icon cute của thúi và nhưng cái nhõng nhẽo của thúi làm chồn cảm giác trong ngày hôm đó là một ngày tràn đầy năng lượng với chồn một ngày sảng khoái lắm thúi ạ nên thúi nên nhõng nhẽo với chồn nhiều hơn và chăm chụp ảnh để ngày ngày chồn được nạp năng lượng giúp chồn một ngày giảm bớt những căng thẳng ạ. Đôi khi chồn lười cả tối chỉ biết ngồi chơi thì những lời động lực đầy ý nghĩa của thúi khiến chồn chăm học hơn.Thật nhanh thúi nhỉ mới ngày nào còn cậu cậu tớ tớ mà giờ thoáng cái đã trôi qua hơn một năm rùi thời gian trôi qua nhanh nhỉ thúi trước chỉ là việc học còn bây giờ là công việc và sự nghiệp cùng nhau cố gắng nha thúi iu thúi thúi của chồn nhất trên đời.
Cảm ơn thúi đã yêu chồn mặc dù có đôi lúc chồn hơi cáu những thúi cũng không trách móc chồn cảm ơn thúi nhiều ạ chồn mong càng ngày mình càng hiểu nhau hơn iu nhau nhiều hơn ạ.

Chúc mình thêm nhiều năm nữa bên nhau nhé thúi! 🌸`;

// 🗓️ Các mốc kỷ niệm trong timeline
const TIMELINE_EVENTS = [
  {
    date: "Tháng 3, 2025",
    event:
      "Lần đầu gặp nhau lúc đấy chỉ đơn giản nghĩ là sẽ kết bạn học bài chung cùng nhau cố gắng mà thoáng cái đã được một năm bên nhau rùi nhanh nhỉ thúi",
    emoji: "💫",
    desc: "Ngày đặc biệt nhất trong cuộc đời chồn",
  },
  {
    date: "Tháng 9, 2025",
    event:
      "Buổi hẹn hò đầu tiên cũng là cái sinh nhật đầu tiên chồn đón sinh nhật cùng thúi chồn nhớ cái lúc đó 2 đứa ngại ngùng chỉ biết nhìn nhau cười ",
    emoji: "💕",
    desc: "Lúc đó chồn và thúi đi ăn rất vui vẻ nhưng lúc đó cũng là lần đầu gặp lên 2 đứa chỉ biết nhìn nhau cười nơi gặp nhau đầu tiên không phải là cái gì đấy quá ấn tượng nhưng aeon hà đông cũng là nơi ngại ngùng cùng mình thúi nhỉ nó cũng là nơi đã gắn bó với mình 1 năm rùi ",
  },
  {
    date: "Tết 2026",
    event: "Cái tết đầu tiên bên nhau",
    emoji: "🧧",
    desc: "Ấm áp hơn bao giờ hết",
  },
  {
    date: "Tháng 2, 2026",
    event: "Chuyến đi đầu tiên hồ đồng đò",
    emoji: "🏕️",
    desc: "Tuy mới trôi qua 3 tháng thôi nhưng chồn vẫn còn nhớ cái đợt mình đi chơi ở hồ đông đò đây là đợt đầu tiên mình đi chơi xa nhớ lại thì vẫn thích cái cảnh đẹp ở đó ngồi bên bếp lửa chill chill bên thúi là thấy cuộc đời này hạnh phúc rùi ",
  },
  {
    date: "Tháng 5, 2026",
    event: "Happy 1 Year! 🎉",
    emoji: "🥂",
    desc: "Chạm ly cho tình yêu của mình!",
  },
];

// 📸 Danh sách ảnh hiển thị trong album (Màn 3)
// Thêm đường dẫn ảnh vào 'src' (ví dụ: 'anh1.jpg', 'anh2.png')
const ALBUM_PHOTOS = [
  { src: 'anh1.jpg', caption: 'Kỷ niệm đẹp nhất là lần đầu tiên mình gặp nhau' },
  { src: 'anh2.jpg', caption: 'Cùng nhau cố gắng nha thúi' },
  { src: 'anh3.jpg', caption: 'Nụ cười của thúi là nắng' },
  { src: 'anh4.jpg', caption: 'Chuyến đi xa đầu tiên của 2 đứa mình ' },
  { src: 'anh5.jpg', caption: 'Khoảnh khắc bình yên của 2 đứa mình ' },
  { src: 'anh6.jpg', caption: 'Tình yêu ngọt ngào của 2 đứa mình ' },
];

// 🌌 Danh sách ảnh hiển thị trong không gian vũ trụ (Màn 2)
// Nếu để mảng rỗng, vũ trụ sẽ lấy ảnh từ ALBUM_PHOTOS ở trên
const GALAXY_PHOTOS = [
  { src: 'anh7.jpg', caption: 'Ngôi sao của anh ✨'},
  { src: 'anh8.jpg', caption: 'Mãi yêu em 💖'},
  { src: 'anh9.jpg', caption: 'Bên nhau mãi mãi 💞'},
  { src: 'anh10.jpg', caption: 'Nụ cười tỏa nắng ☀️'},
  { src: 'anh11.jpg', caption: 'Hạnh phúc đong đầy 🥰'},
  { src: 'anh12.jpg', caption: 'Kỷ niệm khó quên 📸'},
  { src: 'anh13.jpg', caption: 'Tình yêu bất tận 🌌'},
  { src: 'anh14.jpg', caption: 'Luôn bên em 💑'},
  { src: 'anh15.jpg', caption: 'Thế giới của anh 🌍'},
  { src: 'anh16.jpg', caption: 'Yêu thương đong đầy 💌'}
];

// 🎵 Đường dẫn file nhạc (đặt file mp3 cùng thư mục)
const MUSIC_SRC = 'haianh.mp3';

// 💬 Tên hiển thị dưới ảnh chân dung
const PORTRAIT_NAME = 'Thúi yêu của chồn 💕';

// 🎁 Tin nhắn hiện ra khi mở hộp quà
const GIFT_MESSAGE = `🌸 Món quà lớn nhất chồn muốn dành cho thúi chính là tình yêu mỗi ngày — những buổi sáng thức dậy bên nhau, những tiếng cười nhỏ bé, và mãi mãi được ở bên thúi. Happy anniversary, yêu thúi nhiều lắm! 💕`;

// 🌟 Tiêu đề trang chính
const HERO_TITLE   = 'Happy 1st Year<br>Together 💕';
const HERO_SUBTITLE = 'Một năm yêu thương, ngàn kỷ niệm đẹp';

// ✍️ Chữ ký cuối thư
const LETTER_SIGN = 'Mãi yêu thúi, chồn 💕';

// 🦶 Chữ ở footer
const FOOTER_TEXT = 'Cảm ơn thúi đã là một phần của cuộc đời chồn';
const FOOTER_SUB  = '365 ngày · Vô vàn kỷ niệm · Mãi mãi yêu thương';