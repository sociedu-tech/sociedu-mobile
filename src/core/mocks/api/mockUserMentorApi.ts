import { delay, withApiResponse } from '../utils';
import { mockMentorListDTO, mockUserProfilesDTO } from '../data/mentorData';

function getMyMentor() {
  const mentor = mockMentorListDTO[0];
  if (!mentor.packages) mentor.packages = [];
  mentor.packages.forEach((pkg, pkgIndex) => {
    pkg.versions = (pkg.versions ?? []).map((version, versionIndex) => ({
      ...version,
      isActive: version.isActive ?? true,
      hasOrders: version.hasOrders ?? (pkgIndex === 0 && versionIndex === 0),
      isEditable: version.isEditable ?? !(version.hasOrders ?? (pkgIndex === 0 && versionIndex === 0)),
      curriculums: version.curriculums ?? [],
    }));
  });
  return mentor;
}

function nextPackageId() {
  const mentor = getMyMentor();
  return Math.max(1000, ...mentor.packages.map((pkg) => Number(pkg.id))) + 1;
}

function nextVersionId(pkgId: number) {
  const mentor = getMyMentor();
  const pkg = mentor.packages.find((item) => Number(item.id) === pkgId);
  const ids = (pkg?.versions ?? []).map((version) => Number(version.id));
  return Math.max(pkgId * 100, ...ids, pkgId * 100) + 1;
}

function nextCurriculumId(versionId: number, version: { curriculums?: { id: number }[] }) {
  const ids = (version.curriculums ?? []).map((item) => Number(item.id));
  return Math.max(versionId * 100, ...ids, versionId * 100) + 1;
}

export const mockMentorApi = {
  getAll: async () => {
    await delay(1000);
    return withApiResponse(mockMentorListDTO);
  },

  getProfile: async (id: string | number) => {
    await delay(800);
    if (id === 'me') {
      return withApiResponse(getMyMentor());
    }
    const mentor = mockMentorListDTO.find((item) => item.userId === Number(id)) || mockMentorListDTO[0];
    return withApiResponse(mentor);
  },

  getPackages: async (id: string | number) => {
    await delay(800);
    const mentor = mockMentorListDTO.find((item) => item.userId === Number(id)) || mockMentorListDTO[0];
    return withApiResponse(mentor.packages);
  },

  getMyServices: async () => {
    await delay(500);
    return withApiResponse(getMyMentor().packages);
  },

  getMyPackageById: async (pkgId: string | number) => {
    await delay(400);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');
    return withApiResponse(pkg);
  },

  createPackage: async (data: { name: string; description?: string; isActive: boolean }) => {
    await delay(700);
    const mentor = getMyMentor();
    const newPackage = {
      id: nextPackageId(),
      mentorId: mentor.userId,
      name: data.name,
      description: data.description ?? '',
      isActive: data.isActive,
      versions: [],
    };
    mentor.packages.push(newPackage);
    return withApiResponse(newPackage);
  },

  updatePackage: async (
    pkgId: string | number,
    data: { name: string; description?: string; isActive: boolean },
  ) => {
    await delay(500);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');
    pkg.name = data.name;
    pkg.description = data.description ?? '';
    pkg.isActive = data.isActive;
    return withApiResponse(pkg);
  },

  getPackageVersionById: async (pkgId: string | number, versionId: string | number) => {
    await delay(350);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    const version = pkg?.versions?.find((item) => String(item.id) === String(versionId));
    if (!pkg || !version) throw new Error('Khong tim thay version.');
    return withApiResponse(version);
  },

  createPackageVersion: async (pkgId: string | number, data: any) => {
    await delay(700);
    const mentor = getMyMentor();
    const pkg = mentor.packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');

    const numericPkgId = Number(pkg.id);
    const versionId = nextVersionId(numericPkgId);

    if (data.isDefault) {
      pkg.versions.forEach((version) => {
        version.isDefault = false;
      });
    }

    const newVersion = {
      id: versionId,
      price: data.price,
      duration: data.duration,
      deliveryType: data.deliveryType,
      isDefault: data.isDefault,
      isActive: data.isActive,
      hasOrders: false,
      isEditable: true,
      curriculums: (data.curriculums ?? []).map((item: any, index: number) => ({
        id: nextCurriculumId(versionId, { curriculums: [] }) + index,
        title: item.title,
        description: item.description ?? '',
        orderIndex: index + 1,
        duration: item.duration ?? 0,
        packageVersionId: versionId,
      })),
    };

    pkg.versions.push(newVersion);
    return withApiResponse(newVersion);
  },

  updatePackageVersion: async (pkgId: string | number, versionId: string | number, data: any) => {
    await delay(700);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');
    const currentVersion = pkg.versions.find((item) => String(item.id) === String(versionId));
    if (!currentVersion) throw new Error('Khong tim thay version.');

    if (!currentVersion.isEditable || currentVersion.hasOrders) {
      currentVersion.isActive = false;
      if (currentVersion.isDefault) currentVersion.isDefault = false;
      return mockMentorApi.createPackageVersion(pkgId, {
        ...data,
        isActive: true,
        isDefault: true,
      });
    }

    if (data.isDefault) {
      pkg.versions.forEach((version) => {
        version.isDefault = false;
      });
    }

    currentVersion.price = data.price;
    currentVersion.duration = data.duration;
    currentVersion.deliveryType = data.deliveryType;
    currentVersion.isDefault = data.isDefault;
    currentVersion.isActive = data.isActive;
    currentVersion.curriculums = (data.curriculums ?? []).map((item: any, index: number) => ({
      id: item.id ? Number(item.id) : nextCurriculumId(Number(currentVersion.id), currentVersion) + index,
      title: item.title,
      description: item.description ?? '',
      orderIndex: index + 1,
      duration: item.duration ?? 0,
      packageVersionId: Number(currentVersion.id),
    }));

    return withApiResponse(currentVersion);
  },

  deletePackageVersion: async (pkgId: string | number, versionId: string | number) => {
    await delay(400);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');
    const version = pkg.versions.find((item) => String(item.id) === String(versionId));
    if (!version) throw new Error('Khong tim thay version.');
    if (version.hasOrders || !version.isEditable) {
      throw new Error('Version da co order, khong the xoa.');
    }
    if (pkg.versions.length <= 1) {
      throw new Error('Package can it nhat 1 version hop le.');
    }
    if (version.isDefault) {
      throw new Error('Khong the xoa version default hien tai.');
    }
    pkg.versions = pkg.versions.filter((item) => String(item.id) !== String(versionId));
    return withApiResponse(null);
  },

  setDefaultPackageVersion: async (pkgId: string | number, versionId: string | number) => {
    await delay(400);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === String(pkgId));
    if (!pkg) throw new Error('Khong tim thay goi dich vu.');
    pkg.versions.forEach((version) => {
      version.isDefault = String(version.id) === String(versionId);
    });
    const version = pkg.versions.find((item) => String(item.id) === String(versionId));
    return withApiResponse(version ?? null);
  },

  toggleServiceStatus: async (pkgId: string, isActive: boolean) => {
    await delay(300);
    const pkg = getMyMentor().packages.find((item) => String(item.id) === pkgId);
    if (pkg) {
      pkg.isActive = isActive;
    }
    return withApiResponse(null);
  },

  saveService: async (data: any) => {
    await delay(800);
    const mentor = getMyMentor();
    const newPkgId = nextPackageId();
    const newPackage = {
      id: newPkgId,
      mentorId: mentor.userId,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      versions: data.versions.map((version: any, index: number) => ({
        id: Number(`${newPkgId}00${index + 1}`),
        price: version.price,
        duration: version.duration,
        deliveryType: version.deliveryType,
        isDefault: version.isDefault,
        isActive: version.isActive ?? true,
        hasOrders: false,
        isEditable: true,
        curriculums: version.curriculums.map((item: any, curriculumIndex: number) => ({
          id: Number(`${newPkgId}0${index + 1}0${curriculumIndex + 1}`),
          title: item.title,
          description: item.description,
          orderIndex: item.orderIndex,
          duration: item.duration,
          packageVersionId: Number(`${newPkgId}00${index + 1}`),
        })),
      })),
    };

    mentor.packages.push(newPackage);
    return withApiResponse(newPackage);
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
