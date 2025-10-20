import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  isRefuge$!: Observable<boolean>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isRefuge$ = this.authService.isRefugeRole();
  }
}
