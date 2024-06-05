import { OrderService } from '../../services/order/order.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal, WritableSignal } from '@angular/core';
import { MaterialsModule } from '../../materials/materials.module';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  route = inject(Router)
  orderService = inject(OrderService)

  displayedColumns: string[] = ['createdAt', 'writer', 'totalCount', 'to', 'bts'];
  dataSource: WritableSignal<MatTableDataSource<any>> = signal<MatTableDataSource<any>>(new MatTableDataSource());

  pageSize = signal<number>(10);
  resultsLength = signal<number>(0);
  isLoadingResults = signal<boolean>(true);
  isRateLimitReached = signal<boolean>(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { }

  ngAfterViewInit() {

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults.set(true);
          return this.fetchOrders()
        }),
        map((res: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults.set(false);
          if (res === null) {
            this.isRateLimitReached.set(true);
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.isRateLimitReached.set(false);
          this.resultsLength.set(res.data.length);
          // this.calculateTenure(res.myEmployeeList);
          return res.data;
        }),
      )
      .subscribe((data: any) => this.dataSource.set(new MatTableDataSource(data)))
  }

  fetchOrders() {
    return this.orderService.getOrders(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize,
    ).pipe(catchError(() => of(null)));
  }

  refreshTable() {
    this.fetchOrders().subscribe((res: any) => {
      this.isLoadingResults.set(false);
      this.dataSource.set(new MatTableDataSource(res.data));
      this.resultsLength.set(res.data.length);
    });
  }

  updateOrder(id: string) {
    this.route.navigate([`/orders/${id}/edit`])
  }
  deleteOrder(id: string) {
    this.isLoadingResults.set(true);
    this.orderService.deleteOrder(id).subscribe({
      next: (res: any) => {
        console.log(res)
        this.refreshTable()
      },
      error: (err: any) => {
        console.error(err)
      },
      complete: () => {
        this.isLoadingResults.set(false);
      }
    })
  }
}
