/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'firebase/firestore' {
  export type DocumentData = { [field: string]: any }
  export type QueryDocumentSnapshot = {
    id: string
    data(): DocumentData
  }
  export type DocumentSnapshot = {
    id: string
    exists(): boolean
    data(): DocumentData | undefined
  }
  export type QuerySnapshot = {
    docs: QueryDocumentSnapshot[]
    size: number
    empty: boolean
  }
  export type DocumentReference = { id: string }
  export type CollectionReference = Record<string, never>
  export type Query = Record<string, never>
  export type FieldValue = Record<string, never>
  export type Firestore = Record<string, never>

  export class Timestamp {
    static now(): Timestamp
    toDate(): Date
  }

  export function collection(db: any, path: string): CollectionReference
  export function doc(db: any, path: string, ...pathSegments: string[]): DocumentReference
  export function addDoc(reference: any, data: DocumentData): Promise<DocumentReference>
  export function updateDoc(reference: any, data: Partial<DocumentData>): Promise<void>
  export function deleteDoc(reference: any): Promise<void>
  export function getDoc(reference: any): Promise<DocumentSnapshot>
  export function getDocs(query: Query): Promise<QuerySnapshot>
  export function query(reference: any, ...constraints: any[]): Query
  export function where(field: string, op: string, value: any): any
  export function getFirestore(app?: any): Firestore
}

declare module 'firebase/storage' {
  export type FirebaseStorage = Record<string, never>
  export function getStorage(app?: any): FirebaseStorage
}
