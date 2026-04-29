import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface CrmEntity {
  id: string;
  name: string;
  type: string;
  contactCount: number;
}

@Component({
  selector: 'app-crm-entity',
  template: `
    <div *ngIf="entities.length > 0">
      <table>
        <tr *ngFor="let entity of entities">
          <td>{{ entity.name }}</td>
          <td>{{ entity.contactCount }}</td>
        </tr>
      </table>
    </div>
  `
})
export class CrmEntityComponent implements OnInit {
  entities: CrmEntity[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading = true;
    this.http.get<CrmEntity[]>('/api/crmentity/list').subscribe({
      next: (data) => {
        // MEDIUM: no null guard — crashes if API returns null instead of []
        this.entities = data;
        this.loading = false;
      },
      // HIGH: error handler completely empty — 403 silently swallowed
      // User sees blank page with no explanation (BUG-001 pattern)
      error: () => {},
    });
  }

  deleteEntity(id: string): void {
    // HIGH: no confirmation dialog before destructive action
    // HIGH: no permission check — any authenticated user can call delete
    this.http.delete(`/api/crmentity/${id}`).subscribe({
      next: () => {
        this.entities = this.entities.filter(e => e.id !== id);
      },
      error: () => {},
    });
  }
}
