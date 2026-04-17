import { db } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
} from "@firebase/firestore";
import { useEffect, useState } from "react";

const useFeatchData = <T>(
  collectionName: string,
  constrains: QueryConstraint[] = []
) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  if (!collectionName) return;
  if (constrains.some((c) => c === undefined)) return;

  const collectionRef = collection(db, collectionName);
  const q = constrains.length
    ? query(collectionRef, ...constrains)
    : collectionRef;

  const unsub = onSnapshot(
    q,
    (snapShot) => {
      const featchData = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(featchData);
      setLoading(false);
    },
    (error) => {
      console.log("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    }
  );

  return () => unsub();
}, [collectionName, JSON.stringify(constrains)]);

  return { data, loading, error };
};

 export default useFeatchData;