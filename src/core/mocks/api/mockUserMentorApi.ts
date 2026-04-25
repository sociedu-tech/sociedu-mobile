import {
  CurriculumItemResponseDTO,
  ServicePackageResponseDTO,
  UserCertificateResponseDTO,
  UserEducationResponseDTO,
  UserExperienceResponseDTO,
  UserLanguageResponseDTO,
} from '../../types';
import { delay, withApiResponse } from '../utils';
import { mockMentorListDTO, mockUserProfilesDTO } from '../data/mentorData';

function getMentorRecord(id: string | number) {
  return mockMentorListDTO.find((item) => item.userId === Number(id)) ?? mockMentorListDTO[0];
}

function getCurrentMentorRecord() {
  return mockMentorListDTO[0];
}

function clonePackage(pkg: ServicePackageResponseDTO): ServicePackageResponseDTO {
  return {
    ...pkg,
    versions: (pkg.versions ?? []).map((version) => ({
      ...version,
      curriculums: (version.curriculums ?? []).map((curriculum) => ({ ...curriculum })),
    })),
  };
}

export const mockMentorApi = {
  getAll: async () => {
    await delay(1000);
    return withApiResponse(mockMentorListDTO);
  },

  getProfile: async (id: string | number) => {
    await delay(800);
    return withApiResponse(getMentorRecord(id));
  },

  getPackages: async (id: string | number) => {
    await delay(800);
    return withApiResponse(getMentorRecord(id).packages.map(clonePackage));
  },

  getPackageDetail: async (packageId: string | number) => {
    await delay(600);
    const normalizedId = Number(packageId);
    const owner =
      mockMentorListDTO.find((mentor) => mentor.packages.some((pkg) => pkg.id === normalizedId)) ??
      getCurrentMentorRecord();

    return withApiResponse(owner.packages.map(clonePackage));
  },

  getMyServices: async () => {
    await delay(700);
    return withApiResponse(getCurrentMentorRecord().packages.map(clonePackage));
  },

  saveService: async (payload: {
    id?: string;
    name: string;
    description?: string;
    isActive?: boolean;
    versions: {
      id?: string;
      price: number;
      duration: number;
      deliveryType?: string;
      isDefault?: boolean;
      curriculums: {
        title: string;
        description?: string;
        orderIndex: number;
        duration?: number;
      }[];
    }[];
  }) => {
    await delay(900);

    const mentor = getCurrentMentorRecord();
    const packageId = payload.id ? Number(payload.id) : Date.now();

    const nextPackage: ServicePackageResponseDTO = {
      id: packageId,
      mentorId: mentor.userId,
      name: payload.name,
      description: payload.description ?? '',
      isActive: payload.isActive ?? true,
      versions: payload.versions.map((version, versionIndex) => ({
        id: version.id ? Number(version.id) : packageId * 10 + versionIndex + 1,
        price: version.price,
        duration: version.duration,
        deliveryType: version.deliveryType ?? 'ONLINE',
        isDefault: version.isDefault ?? versionIndex === 0,
        curriculums: version.curriculums.map((curriculum, curriculumIndex) => ({
          id: packageId * 100 + curriculumIndex + 1,
          packageVersionId: version.id ? Number(version.id) : packageId * 10 + versionIndex + 1,
          title: curriculum.title,
          description: curriculum.description ?? '',
          orderIndex: curriculum.orderIndex ?? curriculumIndex + 1,
          duration: curriculum.duration ?? 0,
        })),
      })),
    };

    const currentIndex = mentor.packages.findIndex((item) => item.id === packageId);
    if (currentIndex >= 0) {
      mentor.packages[currentIndex] = nextPackage;
    } else {
      mentor.packages.unshift(nextPackage);
    }

    return withApiResponse(clonePackage(nextPackage));
  },

  toggleServiceStatus: async (packageId: string | number, isActive: boolean) => {
    await delay(500);

    const mentor = getCurrentMentorRecord();
    const pkg = mentor.packages.find((item) => item.id === Number(packageId));

    if (!pkg) {
      throw new Error('Không tìm thấy gói dịch vụ.');
    }

    pkg.isActive = isActive;
    return withApiResponse(clonePackage(pkg));
  },

  deletePackage: async (packageId: string | number) => {
    await delay(400);
    const mentor = getCurrentMentorRecord();
    const index = mentor.packages.findIndex((item) => item.id === Number(packageId));

    if (index < 0) {
      throw new Error('Không tìm thấy gói dịch vụ.');
    }

    mentor.packages.splice(index, 1);
    return withApiResponse(null);
  },

  getCurriculum: async (packageId: string | number, versionId: string | number) => {
    await delay(300);
    const pkg = getCurrentMentorRecord().packages.find((item) => item.id === Number(packageId));
    const version = pkg?.versions.find((item) => item.id === Number(versionId));

    return withApiResponse(version?.curriculums ?? []);
  },

  addCurriculumItem: async (
    packageId: string | number,
    versionId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number }
  ) => {
    await delay(400);
    const pkg = getCurrentMentorRecord().packages.find((item) => item.id === Number(packageId));
    const version = pkg?.versions.find((item) => item.id === Number(versionId));

    if (!version) {
      throw new Error('Không tìm thấy phiên bản gói dịch vụ.');
    }

    const nextItem: CurriculumItemResponseDTO = {
      id: Date.now(),
      packageVersionId: Number(versionId),
      title: data.title,
      description: data.description ?? '',
      orderIndex: data.orderIndex,
      duration: data.duration ?? 0,
    };

    version.curriculums = [...(version.curriculums ?? []), nextItem];
    return withApiResponse(nextItem);
  },
};

const mockEducations: UserEducationResponseDTO[] = [];
const mockExperiences: UserExperienceResponseDTO[] = [];
const mockLanguages: UserLanguageResponseDTO[] = [];
const mockCertificates: UserCertificateResponseDTO[] = [];

export const mockUserApi = {
  getMe: async () => {
    await delay(900);
    return withApiResponse(mockUserProfilesDTO.me);
  },

  getPublicProfile: async (id: string | number) => {
    await delay(200);
    const profile = mockUserProfilesDTO[String(id)] || mockUserProfilesDTO['1'];
    return withApiResponse(profile);
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    location?: string;
  }) => {
    await delay(500);
    mockUserProfilesDTO.me.profile = {
      ...mockUserProfilesDTO.me.profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return withApiResponse(null);
  },

  getEducations: async () => {
    await delay(200);
    return withApiResponse(mockEducations);
  },

  addEducation: async (data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }) => {
    await delay(300);
    const item = { ...data, endYear: data.endYear ?? null, id: Date.now() };
    mockEducations.push(item);
    return withApiResponse(item);
  },

  updateEducation: async (id: number, data: Partial<UserEducationResponseDTO>) => {
    await delay(300);
    const index = mockEducations.findIndex((item) => item.id === id);
    const item = { ...(mockEducations[index] ?? { id }), ...data } as UserEducationResponseDTO;
    if (index >= 0) mockEducations[index] = item;
    return withApiResponse(item);
  },

  deleteEducation: async (id: number) => {
    await delay(200);
    const index = mockEducations.findIndex((item) => item.id === id);
    if (index >= 0) mockEducations.splice(index, 1);
    return withApiResponse(null);
  },

  getExperiences: async () => {
    await delay(200);
    return withApiResponse(mockExperiences);
  },

  addExperience: async (data: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }) => {
    await delay(300);
    const item = {
      ...data,
      endDate: data.endDate ?? null,
      description: data.description ?? null,
      id: Date.now(),
    };
    mockExperiences.push(item);
    return withApiResponse(item);
  },

  updateExperience: async (id: number, data: Partial<UserExperienceResponseDTO>) => {
    await delay(300);
    const index = mockExperiences.findIndex((item) => item.id === id);
    const item = { ...(mockExperiences[index] ?? { id }), ...data } as UserExperienceResponseDTO;
    if (index >= 0) mockExperiences[index] = item;
    return withApiResponse(item);
  },

  deleteExperience: async (id: number) => {
    await delay(200);
    const index = mockExperiences.findIndex((item) => item.id === id);
    if (index >= 0) mockExperiences.splice(index, 1);
    return withApiResponse(null);
  },

  getLanguages: async () => {
    await delay(200);
    return withApiResponse(mockLanguages);
  },

  addLanguage: async (data: Omit<UserLanguageResponseDTO, 'id'>) => {
    await delay(300);
    const item = { ...data, id: Date.now() };
    mockLanguages.push(item);
    return withApiResponse(item);
  },

  updateLanguage: async (id: number, data: Partial<UserLanguageResponseDTO>) => {
    await delay(300);
    const index = mockLanguages.findIndex((item) => item.id === id);
    const item = { ...(mockLanguages[index] ?? { id }), ...data } as UserLanguageResponseDTO;
    if (index >= 0) mockLanguages[index] = item;
    return withApiResponse(item);
  },

  deleteLanguage: async (id: number) => {
    await delay(200);
    const index = mockLanguages.findIndex((item) => item.id === id);
    if (index >= 0) mockLanguages.splice(index, 1);
    return withApiResponse(null);
  },

  getCertificates: async () => {
    await delay(200);
    return withApiResponse(mockCertificates);
  },

  addCertificate: async (data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }) => {
    await delay(300);
    const item = {
      ...data,
      expiryDate: data.expiryDate ?? null,
      credentialUrl: data.credentialUrl ?? null,
      id: Date.now(),
    };
    mockCertificates.push(item);
    return withApiResponse(item);
  },

  updateCertificate: async (id: number, data: Partial<UserCertificateResponseDTO>) => {
    await delay(300);
    const index = mockCertificates.findIndex((item) => item.id === id);
    const item = { ...(mockCertificates[index] ?? { id }), ...data } as UserCertificateResponseDTO;
    if (index >= 0) mockCertificates[index] = item;
    return withApiResponse(item);
  },

  deleteCertificate: async (id: number) => {
    await delay(200);
    const index = mockCertificates.findIndex((item) => item.id === id);
    if (index >= 0) mockCertificates.splice(index, 1);
    return withApiResponse(null);
  },
};
