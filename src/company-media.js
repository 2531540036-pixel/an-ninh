// Original company booklet photographs. SVG viewports present selected regions;
// the source pixels are never regenerated. Only public activity pages are included.
const photo = (file, box, alt, rotate = true, width = 2560, height = 1920) => ({
  src: `/company-images/${file}.jpg`,
  box,
  alt,
  rotate,
  width,
  height,
});
export const media = {
  logo: photo(
    "ho-so-an-ninh",
    [202, 358, 272, 254],
    "Logo Công ty Bảo vệ An Ninh",
    false,
    1920,
    2560,
  ),
  team: photo(
    "doi-ngu-an-ninh",
    [165, 835, 1160, 650],
    "Đội ngũ bảo vệ An Ninh trong hồ sơ công ty",
  ),
  martial: photo(
    "doi-ngu-an-ninh",
    [180, 1745, 1120, 640],
    "Rèn luyện võ thuật và tác phong bảo vệ",
  ),
  training: photo(
    "huan-luyen-nghiep-vu",
    [565, 1320, 1220, 800],
    "Nhân viên tham gia huấn luyện nghiệp vụ bảo vệ",
  ),
  classroom: photo(
    "huan-luyen-nghiep-vu",
    [620, 390, 1110, 700],
    "Lớp huấn luyện nghiệp vụ của An Ninh",
  ),
  fire: photo(
    "pccc-so-cap-cuu",
    [50, 900, 1150, 610],
    "Thực hành phòng cháy và chữa cháy",
  ),
  firstaid: photo(
    "pccc-so-cap-cuu",
    [65, 1720, 1150, 680],
    "Huấn luyện sơ cấp cứu",
  ),
  office: photo(
    "muc-tieu-bao-ve",
    [170, 660, 1110, 600],
    "Hình ảnh đội ngũ tại Bưu điện thành phố Đà Nẵng trong hồ sơ",
  ),
  hospital: photo(
    "hoat-dong-va-ghi-nhan",
    [300, 200, 680, 900],
    "Đội ngũ An Ninh tại Bệnh viện Đà Nẵng trong hồ sơ",
  ),
  hospitalWide: photo(
    "muc-tieu-bao-ve",
    [160, 1510, 1110, 720],
    "Đội ngũ tại Bệnh viện Đa khoa Quảng Nam trong hồ sơ",
  ),
  recognition: photo(
    "hoat-dong-va-ghi-nhan",
    [370, 1400, 1230, 820],
    "Hội nghị tuyên dương thực hiện tốt chính sách pháp luật thuế năm 2014",
  ),
};
export const serviceMedia = [
  media.office,
  media.fire,
  media.team,
  media.hospitalWide,
];
export const gallery = [
  {
    photo: media.team,
    category: "Đội ngũ",
    title: "Kỷ luật trong từng tác phong",
  },
  { photo: media.training, category: "Đào tạo", title: "Huấn luyện nghiệp vụ" },
  { photo: media.fire, category: "Đào tạo", title: "Thực hành PCCC" },
  { photo: media.firstaid, category: "Đào tạo", title: "Kỹ năng sơ cấp cứu" },
  { photo: media.hospitalWide, category: "Mục tiêu", title: "Tại cơ sở y tế" },
  {
    photo: media.recognition,
    category: "Ghi nhận",
    title: "Dấu mốc trong hành trình",
  },
];
