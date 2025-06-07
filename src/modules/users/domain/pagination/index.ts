import { PaginateConfig } from 'nestjs-paginate';

import { User } from '@/modules/users/domain';

export const usersPaginateConfig: PaginateConfig<User> = {
  relations: ['roles', 'roles.permissions'],
  sortableColumns: [
    'id',
    'email',
    'firstName',
    'lastName',
    'isActive',
    'createdAt',
  ],
  searchableColumns: ['email', 'firstName', 'lastName'],
  defaultSortBy: [['createdAt', 'DESC']],
  filterableColumns: {
    isActive: true,
  },
  select: [
    'id',
    'email',
    'firstName',
    'lastName',
    'isActive',
    'createdAt',
    'roles.name',
    'roles.permissions.name',
  ],
};
