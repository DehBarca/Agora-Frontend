import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GroupService } from '../services/group.service';

export const groupMemberGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const groupService = inject(GroupService);
  const groupId = route.paramMap.get('id');

  if (!groupId) {
    router.navigateByUrl('/home');
    return false;
  }

  return groupService.getMyGroupMember(groupId).pipe(
    map((membership) => {
      if (membership) {
        return true;
      }

      router.navigateByUrl('/home');
      return false;
    }),
    catchError(() => {
      router.navigateByUrl('/home');
      return of(false);
    })
  );
};
