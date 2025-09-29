import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Laptop, LaptopStatus } from '../models/laptop.model';

@Injectable({
  providedIn: 'root'
})
export class LaptopService {
  private readonly collectionName = 'laptops';

  constructor(private firestore: Firestore) {}

  // Get all laptops
  getLaptops(): Observable<Laptop[]> {
    const laptopsRef = collection(this.firestore, this.collectionName);
    const q = query(laptopsRef, orderBy('asset_tag'));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Laptop)))
    );
  }

  // Get laptop by ID
  getLaptopById(id: string): Observable<Laptop | undefined> {
    const laptopRef = doc(this.firestore, this.collectionName, id);
    return from(getDocs(collection(this.firestore, this.collectionName))).pipe(
      map(snapshot => {
        const doc = snapshot.docs.find(d => d.id === id);
        return doc ? { id: doc.id, ...doc.data() } as Laptop : undefined;
      })
    );
  }

  // Add new laptop
  addLaptop(laptop: Omit<Laptop, 'id'>): Observable<string> {
    const laptopsRef = collection(this.firestore, this.collectionName);
    const laptopData = {
      ...laptop,
      created_at: new Date(),
      updated_at: new Date()
    };
    return from(addDoc(laptopsRef, laptopData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Update laptop
  updateLaptop(id: string, laptop: Partial<Laptop>): Observable<void> {
    const laptopRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...laptop,
      updated_at: new Date()
    };
    return from(updateDoc(laptopRef, updateData));
  }

  // Delete laptop
  deleteLaptop(id: string): Observable<void> {
    const laptopRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(laptopRef));
  }

  // Get laptops by status
  getLaptopsByStatus(): Observable<LaptopStatus> {
    return this.getLaptops().pipe(
      map(laptops => {
        const status: LaptopStatus = {
          available: [],
          assigned: [],
          damaged: []
        };

        laptops.forEach(laptop => {
          // If laptop is marked as damaged, it goes to damaged list regardless of assignment
          if (laptop.damaged) {
            status.damaged.push(laptop);
          } else if (!laptop.assigned_to || laptop.assigned_to.trim() === '') {
            // If laptop has no assignment and is not damaged, it's available
            status.available.push(laptop);
          } else {
            // If laptop is assigned and not damaged, it's assigned
            status.assigned.push(laptop);
          }
        });

        return status;
      })
    );
  }

  // Search laptops by asset tag or assigned person
  searchLaptops(searchTerm: string): Observable<Laptop[]> {
    return this.getLaptops().pipe(
      map(laptops => laptops.filter(laptop => 
        laptop.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (laptop.assigned_to && laptop.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) ||
        laptop.make.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
}
