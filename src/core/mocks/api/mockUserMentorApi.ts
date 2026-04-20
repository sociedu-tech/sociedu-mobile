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
