import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public filterData: string = undefined;
  
  changeData: string;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private monitorService: MonitorService
  ) { }

  ngOnInit(): void {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.router.navigate(['/']);
    }
    // this.admValue = this.route.snapshot.paramMap.get('admin');
    // if (this.authService.superAdmin() == 'c4ca4238a0b923820dcc509a6f75849b' && this.admValue == "admin"){
    //   this.superAdmin = 1;
    // }
    this.monitorService.handleData('Search');
    this.monitorService.handleMessage.subscribe(res => this.changeData = res);
  }

  filterList(value){
    this.filterData = value;
  }
}
