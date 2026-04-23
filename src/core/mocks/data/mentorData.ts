import { MentorProfileResponseDTO, UserFullProfileResponseDTO } from '../../types';

export const mockMentorListDTO: MentorProfileResponseDTO[] = [
  {
    userId: 1, // Long -> ID mentor 1 (tương ứng với User ID UUID trong UserFullProfile)
    headline: "Senior Software Engineer @ Google",
    expertise: "React Native, Cloud, System Design",
    basePrice: 50.0,
    ratingAvg: 4.9,
    sessionsCompleted: 142,
    verificationStatus: "VERIFIED",
    packages: [
      {
        id: 101,
        mentorId: 1,
        name: "Mock Interview & Tư vấn CV",
        description: "Review logic kiến trúc và Mock Phỏng vấn thử",
        isActive: true,
        versions: [
          { 
            id: 1001, price: 50, duration: 60, deliveryType: "ONLINE", isDefault: true,
            curriculums: [
              { id: 1, packageVersionId: 1001, title: "Review CV & Định hướng", description: "Đánh giá chi tiết CV hiện tại", orderIndex: 1, duration: 20 },
              { id: 2, packageVersionId: 1001, title: "Mock Interview (Kỹ thuật)", description: "Phỏng vấn thuật toán và system design", orderIndex: 2, duration: 40 }
            ]
          },
          { 
            id: 1002, price: 80, duration: 120, deliveryType: "ONLINE", isDefault: false,
            curriculums: [
              { id: 3, packageVersionId: 1002, title: "Mock Interview Full", description: "120 phút phỏng vấn chuyên sâu", orderIndex: 1, duration: 120 }
            ]
          }
        ]
      }
    ]
  },
  {
    userId: 2,
    headline: "Marketing Manager & Content Creator",
    expertise: "Digital Marketing, SEO, Copywriting",
    basePrice: 35.0,
    ratingAvg: 4.7,
    sessionsCompleted: 89,
    verificationStatus: "VERIFIED",
    packages: [
      {
        id: 201,
        mentorId: 2,
        name: "Lộ trình Content Từ Zero đến Hero",
        description: "Học cách viết lách có tư duy",
        isActive: true,
        versions: [
          { id: 2001, price: 35, duration: 60, deliveryType: "ONLINE", isDefault: true }
        ]
      }
    ]
  }
];

export const mockUserProfilesDTO: Record<string, UserFullProfileResponseDTO> = {
  "1": {
    profile: {
      userId: "1",
      firstName: "Hoàng Minh",
      lastName: "Trần",
      headline: "Senior Software Engineer @ Google",
      avatarFileId: "c2003c2a-da77-4b15-9988-121f00a44abc", // Dummy avatar
      bio: "Mình có hơn 8 năm làm việc tại môi trường SI Silicon, sẵn sàng chia sẻ kinh nghiệm.",
      location: "San Francisco, USA",
      createdAt: "2024-01-01T12:00:00Z",
      updatedAt: "2024-01-02T12:00:00Z"
    },
    educations: [
      { id: 1, institution: "Đại học Bách Khoa", degree: "Kỹ sư", fieldOfStudy: "CNTT", startYear: 2012, endYear: 2016 }
    ],
    experiences: [],
    languages: [],
    certificates: []
  },
  "2": {
    profile: {
      userId: "2",
      firstName: "Hồng Nhung",
      lastName: "Phạm",
      headline: "Marketing Manager",
      avatarFileId: null,
      bio: null,
      location: "Hà Nội, Việt Nam",
      createdAt: "2024-01-01T12:00:00Z",
      updatedAt: "2024-01-02T12:00:00Z"
    },
    educations: [], experiences: [], languages: [], certificates: []
  },
  "me": {
    profile: {
      userId: "e34a621c-a90b-4bd2-bea4-23be5185ea93",
      firstName: "Nguyễn Văn",
      lastName: "Học Viên",
      headline: "Sinh viên ĐH Quốc Gia",
      avatarFileId: null,
      bio: "Đang học ngành Khoa học MT",
      location: "Hồ Chí Minh",
      createdAt: "2024-03-01T12:00:00Z",
      updatedAt: "2024-03-01T12:00:00Z"
    },
    educations: [], experiences: [], languages: [], certificates: []
  }
};
