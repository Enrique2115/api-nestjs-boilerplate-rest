import { PaginateConfig } from 'nestjs-paginate';

import { Role } from '@/modules/roles/domain';

export const rolesPaginateConfig: PaginateConfig<Role> = {
  relations: ['permissions'],
  sortableColumns: ['id', 'name', 'description', 'isActive', 'createdAt'],
  searchableColumns: ['name', 'description'],
  defaultSortBy: [['createdAt', 'DESC']],
  filterableColumns: {
    isActive: true,
  },
  defaultLimit: 10,
  select: [
    'id',
    'name',
    'description',
    'isActive',
    'createdAt',
    'permissions.name',
    'permissions.description',
    'permissions.isActive',
    'permissions.createdAt',
  ],
};
