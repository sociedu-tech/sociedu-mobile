import { delay, withApiResponse } from '../utils';
import { mockMentorListDTO, mockUserProfilesDTO } from '../data/mentorData';

// Gộp chung phần trả về cho MentorService và UserService
export const mockMentorApi = {
  getAll: async () => {
    await delay(1000);
    return withApiResponse(mockMentorListDTO);
  },

  getProfile: async (id: string | number) => {
    await delay(800);
    const m = mockMentorListDTO.find(x => x.userId === Number(id)) || mockMentorListDTO[0];
    return withApiResponse(m);
  },
  
  getPackages: async (id: string | number) => {
    await delay(800);
    const m = mockMentorListDTO.find(x => x.userId === Number(id)) || mockMentorListDTO[0];
    return withApiResponse(m.packages);
  },

  // ─── STATEFUL METHODS FOR E2E TESTING ───
  getMyServices: async () => {
    await delay(500);
    // Luôn lấy mentor đầu tiên làm mentor của "tôi" (userId = 1)
    const m = mockMentorListDTO[0];
    return withApiResponse(m.packages);
  },

  toggleServiceStatus: async (pkgId: string, isActive: boolean) => {
    await delay(300);
    const m = mockMentorListDTO[0];
    const pkg = m.packages?.find(p => String(p.id) === pkgId);
    if (pkg) {
      pkg.isActive = isActive;
    }
    return withApiResponse(null);
  },

  saveService: async (data: any) => {
    await delay(800);
    const m = mockMentorListDTO[0];
    if (!m.packages) m.packages = [];
    
    // Tạo ID mới tự tăng
    const newPkgId = Math.max(...m.packages.map(p => p.id), 1000) + 1;
    
    const newPackage = {
      id: newPkgId,
      mentorId: m.userId,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      versions: data.versions.map((v: any, index: number) => ({
        id: Number(`${newPkgId}00${index + 1}`),
        price: v.price,
        duration: v.duration,
        deliveryType: v.deliveryType,
        isDefault: v.isDefault,
        curriculums: v.curriculums.map((c: any, cIdx: number) => ({
          id: Number(`${newPkgId}0${index + 1}0${cIdx + 1}`),
          title: c.title,
          description: c.description,
          orderIndex: c.orderIndex,
          duration: c.duration,
        }))
      }))
    };

    m.packages.push(newPackage);
    return withApiResponse(newPackage);
  }
};

export const mockUserApi = {
  getMe: async () => {
    await delay(900);
    return withApiResponse(mockUserProfilesDTO["me"]);
  },

  getPublicProfile: async (id: string | number) => {
    // Không cần delay lâu quá để tránh fetch N+1 bị lag
    await delay(200);
    const profile = mockUserProfilesDTO[String(id)] || mockUserProfilesDTO["1"];
    return withApiResponse(profile);
  }
};
