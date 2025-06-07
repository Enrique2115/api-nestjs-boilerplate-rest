import { PaginateConfig } from 'nestjs-paginate';

import { Permission } from '@/modules/permission/domain';

export const permissionsPaginateConfig: PaginateConfig<Permission> = {
  sortableColumns: ['id', 'name', 'description', 'isActive', 'createdAt'],
  searchableColumns: ['name', 'description'],
  defaultSortBy: [['createdAt', 'DESC']],
  filterableColumns: {
    isActive: true,
  },
  select: ['id', 'name', 'description', 'isActive', 'createdAt'],
};
