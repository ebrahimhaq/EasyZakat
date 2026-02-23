import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ZakatData, Asset } from '../types';
import { loadData, saveData } from '../services/storage';
import { calculateZakat } from '../services/calculator';
import type { ZakatCalculationResult } from '../types';

// ─── State ───────────────────────────────────────────────────────────────────
interface AppState {
  data: ZakatData;
  result: ZakatCalculationResult | null;
  isDirty: boolean;
  activeSection: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOAD_DATA'; payload: ZakatData }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'UPDATE_ASSET'; payload: Asset }
  | { type: 'DELETE_ASSET'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ZakatData['settings']> }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'MARK_CLEAN' };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.payload,
        result: calculateZakat(action.payload),
        isDirty: false,
      };

    case 'ADD_ASSET': {
      const newData = {
        ...state.data,
        assets: [...state.data.assets, action.payload],
      };
      return {
        ...state,
        data: newData,
        result: calculateZakat(newData),
        isDirty: true,
      };
    }

    case 'UPDATE_ASSET': {
      const newData = {
        ...state.data,
        assets: state.data.assets.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
      return {
        ...state,
        data: newData,
        result: calculateZakat(newData),
        isDirty: true,
      };
    }

    case 'DELETE_ASSET': {
      const newData = {
        ...state.data,
        assets: state.data.assets.filter((a) => a.id !== action.payload),
      };
      return {
        ...state,
        data: newData,
        result: calculateZakat(newData),
        isDirty: true,
      };
    }

    case 'UPDATE_SETTINGS': {
      const newData = {
        ...state.data,
        settings: { ...state.data.settings, ...action.payload },
      };
      return {
        ...state,
        data: newData,
        result: calculateZakat(newData),
        isDirty: true,
      };
    }

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };

    case 'MARK_CLEAN':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  save: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialData = loadData();
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    result: calculateZakat(initialData),
    isDirty: false,
    activeSection: 'dashboard',
  });

  // Auto-save on change
  useEffect(() => {
    if (state.isDirty) {
      saveData(state.data);
      dispatch({ type: 'MARK_CLEAN' });
    }
  }, [state.isDirty, state.data]);

  const save = useCallback(() => {
    saveData(state.data);
    dispatch({ type: 'MARK_CLEAN' });
  }, [state.data]);

  return (
    <AppContext.Provider value={{ state, dispatch, save }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
