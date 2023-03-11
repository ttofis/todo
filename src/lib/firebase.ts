import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, where, type DocumentData } from "firebase/firestore";
import { derived, readable, writable, type Readable } from "svelte/store";
import type { Task, UserData, ItemTaskGroup, TaskGroup, ItemTask, TaskGroupRecord, TaskRecord } from "$lib/types/data";
import { dev } from "$app/environment";

const firebaseConfig = {
    apiKey: "AIzaSyDHED_PL14lY-uxhPzzX-Q6Yu5TkmaKXD0",
    authDomain: "todo-379621.firebaseapp.com",
    projectId: "todo-379621",
    storageBucket: "todo-379621.appspot.com",
    messagingSenderId: "580166982159",
    appId: "1:580166982159:web:8af8cbea4f64a7e17e617a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const currentUser = readable(auth.currentUser, (set) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        set(user);
    });

    return () => unsubscribe();
});

const nullUserData = {uid: "", name: "", group_list: []} as UserData; // we prefer always having a UserData type

export const userData = derived<Readable<User | null>, UserData>(currentUser, ($currentUser, set) => {
    if (!$currentUser) {
        set(nullUserData);
    } else {
        const usersRef = doc(db, "users", $currentUser.uid);
        getDoc(usersRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                set({uid: $currentUser.uid, ...snapshot.data()} as UserData)
            }else{
                set(nullUserData);
            }
        }).catch(() => {
            set(nullUserData);
        })

        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                set({uid: $currentUser.uid, ...snapshot.data()} as UserData)
            }else{
                set(nullUserData);
            }
        });
        return () => unsubscribe();
    }    
}, nullUserData);

export function logout() {
    auth.signOut()
    .catch((err) => {
        console.log(err);
    })
}

export const tasks = writable<Map<string, Task>>(new Map<string, Task>(), () => {
    const unsubscribe = userData.subscribe((user) => {
        if (user.uid !== "" && user.uid != undefined) {
            const refTasks = collection(db, "tasks");
            const qTasks = query(refTasks, where("author", "==", user.uid));

            const unsubscribe = onSnapshot(qTasks, (snapshot) => {
                tasks.update((cpTasks) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added" || change.type === "modified") {
                            const data = change.doc.data() as TaskRecord;
                            let items = data.subtasks.map((val) => {return {id: val, tid: val} as ItemTask})
                            cpTasks.set(change.doc.id, {items, ...data} as Task);
                        }
                        if (change.type === "removed") {
                            cpTasks.delete(change.doc.id);
                        }
                    });
                    return cpTasks;
                });
            }, (err) => {
                if (dev) console.log(err);
            });
            return () => unsubscribe();
        }else{
            return new Map<string, Task>();
        }
    })
    return () =>  unsubscribe();
});

export const groups = writable<Map<string, TaskGroup>>(new Map<string, TaskGroup>(), (set) => {
    const unsubscribe = userData.subscribe((user) => {
        if (user.uid !== "" && user.uid != undefined) {
            const refGroups = collection(db, "users", user.uid, "task_groups");

            const unsubscribe = onSnapshot(refGroups, (snapshot) => {
                groups.update((cpGroups) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added" || change.type === "modified") {
                            const data = change.doc.data() as TaskGroupRecord;
                            let items = data.tasks.map((val) => {return {id: val, tid: val} as ItemTask})
                            cpGroups.set(change.doc.id, {items: items, ...data} as TaskGroup);
                        }
                        if (change.type === "removed") {
                            cpGroups.delete(change.doc.id);
                        }
                    });
                    return cpGroups;
                });            
            }, (err) => {
                if (dev) console.log(err);
            });

            return () => {
                unsubscribe();
            }
        }else{
            new Map<string, TaskGroup>();
        }
    })
    return () => unsubscribe();
});

export const groupItems = writable<ItemTaskGroup[]>([], (set) => {
    const unsubscribe = userData.subscribe((user) => {
        set(user.group_list.map((val) => {return {id: val, gid: val} as ItemTaskGroup}))
    })

    return () => unsubscribe();
});

export async function loadData(user: User) {
    const refTasks = collection(db, "tasks");
    const qTasks = query(refTasks, where("author", "==", user.uid));
    const refGroups = collection(db, "users", user.uid, "task_groups");

    await Promise.allSettled([
        getDocs(qTasks)
        .then((snapshot) => {
            tasks.update((ts) => {
                snapshot.docs.forEach((obj) => {
                    const data = obj.data() as TaskRecord;
                    const items = data.subtasks.map((val) => {return {id: val, tid: val} as ItemTask})
                    ts.set(obj.id, {items: items, ...data} as Task);
                })
                return ts;
            });
        }),
        getDocs(refGroups)
        .then((snapshot) => {
            groups.update((gs) => {
                snapshot.docs.forEach((obj) => {
                    const data = obj.data() as TaskGroupRecord;
                    const items = data.tasks.map((val) => {return {id: val, tid: val} as ItemTask})
                    gs.set(obj.id, {items:items, ...data} as TaskGroup);
                })
                return gs;
            });
        })
    ]).catch((err) => {
        console.log(err);
        return;
    });
}