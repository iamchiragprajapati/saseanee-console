import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { MemberService } from '@services/member.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private memberService: MemberService
  ) {}

  @Input() set appHasPermission(permissionName: string) {
    if (this.memberService.hasPermission(permissionName)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
