import { ServicePackageResponseDTO } from '../../types';
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
};

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
};
