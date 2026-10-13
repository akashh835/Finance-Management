import { useContext } from 'react'
import { FinanceContext } from '../context/FinanceContextSimple'

export function useFinance() {
  return useContext(FinanceContext)
}
