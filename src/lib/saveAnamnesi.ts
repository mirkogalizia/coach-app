import { db, storage } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function saveAnamnesiData(uid: string, data: any) {
  const userRef = doc(db, "users", uid);

  const fotoUrls: any = {};

  const uploadImage = async (file: File, name: string) => {
    const storageRef = ref(storage, `users/${uid}/photos/${name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  if (data.fotoFront) {
    fotoUrls.fotoFrontUrl = await uploadImage(data.fotoFront, "front.jpg");
  }

  if (data.fotoSide) {
    fotoUrls.fotoSideUrl = await uploadImage(data.fotoSide, "side.jpg");
  }

  if (data.fotoBack) {
    fotoUrls.fotoBackUrl = await uploadImage(data.fotoBack, "back.jpg");
  }

  const cleanData = { ...data };
  delete cleanData.fotoFront;
  delete cleanData.fotoSide;
  delete cleanData.fotoBack;

  await setDoc(
    userRef,
    {
      anamnesi: {
        ...cleanData,
        ...fotoUrls,
        createdAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
}