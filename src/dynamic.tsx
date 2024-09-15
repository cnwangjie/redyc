import React, {
  type FC,
  type ReactNode,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const allContainers = new Map<string, Context>()

export const dynamicCreateElement: CreateElement = (
  element: JSX.Element,
  name?: string,
) => {
  const c =
    name && allContainers.has(name)
      ? allContainers.get(name)
      : allContainers.values().next().value

  if (!c) {
    throw new Error(
      'dynamicCreateElement must be used with DynamicCreateElementContainer for now.',
    )
  }

  return c.createElement(element, name)
}

export const useDynamicCreateElement = () => {
  const c = useContext(DynamicCreateElementContext)
  return c.createElement || dynamicCreateElement
}

type CreateElement = (element: JSX.Element, name?: string) => () => void

interface Context {
  child: Set<Context>
  createElement: CreateElement
}

const DynamicCreateElementContext = createContext<Context>({
  child: new Set(),
  createElement: () => () => {},
})

export const useForceUpdate = () => {
  const [, set] = useState(0)
  return useCallback(() => set(i => i + 1), [])
}

export const DynamicCreateElementContainer: FC<{
  name?: string
  children?: ReactNode
}> = ({ children, name = `${Math.random()}` }) => {
  const forceUpdate = useForceUpdate()
  const elements = useMemo(() => new Set<JSX.Element>(), [])
  const parent = useContext(DynamicCreateElementContext)
  const child = useMemo(() => new Set<Context>(), [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: not allowed to change name for container
  const createElement = useCallback((args: JSX.Element, _name?: string) => {
    if (name !== _name && child.size) {
      // biome-ignore lint/style/noNonNullAssertion: child is not empty
      const c = child.values().next().value!
      return c.createElement(args) || (() => {})
    }
    const element = cloneElement(args, {
      key: `dynamic-create-element-${Math.random()}`,
    })
    elements.add(element)
    forceUpdate()
    return () => {
      elements.delete(element)
      forceUpdate()
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: the values are not changed
  const value = useMemo<Context>(() => {
    return {
      child,
      createElement,
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: not allowed to change name for container
  useEffect(() => {
    parent.child.add(value)
    allContainers.set(name, value)
    return () => {
      parent.child.delete(value)
      allContainers.delete(name)
    }
  }, [])

  return (
    <DynamicCreateElementContext.Provider value={value}>
      {children}
      [...elements.values()]
    </DynamicCreateElementContext.Provider>
  )
}
