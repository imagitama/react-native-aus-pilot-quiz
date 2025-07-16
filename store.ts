import AsyncStorage from "@react-native-async-storage/async-storage"; // will fall back to localStorage on web
import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import {
  PersistConfig,
  createTransform,
  persistReducer,
  persistStore,
} from "redux-persist";
import quizReducer, { QuizState } from "./features/quiz/quizSlice";

const quizTransform = createTransform<QuizState, Partial<QuizState>>(
  (inboundState) => {
    const { questionData, ...rest } = inboundState;
    return rest;
  },
  (outboundState) => {
    return {
      ...outboundState,
      questionData: null,
    } as QuizState;
  },
  { whitelist: ["quiz"] }
);

const rootReducer = combineReducers({
  quiz: quizReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["quiz"],
  transforms: [quizTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist uses non-serializable values internally
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
