import * as Tabs from '@radix-ui/react-tabs';
import {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from '@radix-ui/react-tabs';
import { tabGroupStyles } from '.';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { cardStyles } from '../../components/card';

type MyContextProps = TabsProps & {
  selectedTabRef: React.MutableRefObject<TabsTriggerElement | null>;
  selectedTab: string | undefined;
  setSelectedTab: React.Dispatch<React.SetStateAction<string | undefined>>;
  indicatorRef: React.MutableRefObject<null>;
};

const TabsContext = createContext<MyContextProps | undefined>(undefined);

type TabsPropsWithChildren = TabsProps & {
  children: React.ReactNode;
};

type TabsTriggerElement = React.ElementRef<typeof Primitive.button>;
type TabsElement = React.ElementRef<typeof Primitive.div>;

const TabsContextProvider: React.FC<TabsPropsWithChildren> = ({
  children,
  ...props
}) => {
  const [selectedTab, setSelectedTab] = React.useState(props.defaultValue);
  const selectedTabRef = React.useRef<TabsTriggerElement>(null);
  const indicatorRef = React.useRef(null);

  return (
    <TabsContext.Provider
      value={{
        ...props,
        selectedTab,
        setSelectedTab,
        selectedTabRef,
        indicatorRef,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

const useTabs = (): MyContextProps => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a MyTabsContextProvider');
  }
  return context;
};

export const TabGroup = React.forwardRef<TabsElement, TabsProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <TabsContextProvider {...props}>
        <TabGroupInner {...props} ref={forwardedRef}>
          {children}
        </TabGroupInner>
      </TabsContextProvider>
    );
  }
);

const TabGroupInner = React.forwardRef<TabsElement, TabsProps>(
  ({ children, ...props }, forwardedRef) => {
    const tabContext = useTabs();

    // This overrides the default onValueChange function to apply the transition animation
    // then it calls the original onValueChange function
    const handleValueChange = (newValue: string) => {
      // This will trigger the transition animation for the indicator inside TabList
      tabContext.setSelectedTab(newValue);
      // Call the original onValueChange function if it exists
      if (props.onValueChange) {
        props.onValueChange(newValue);
      }
    };

    return (
      <Tabs.Root
        {...props}
        onValueChange={handleValueChange}
        ref={forwardedRef}
      >
        {children}
      </Tabs.Root>
    );
  }
);

export const TabList = React.forwardRef<TabsElement, TabsListProps>(
  ({ children, ...props }, forwardRef) => {
    const tabContext = useTabs();

    const [indicatorWidth, setIndicatorWidth] = useState(0);
    const [indicatorLeftEdge, setIndicatorLeftEdge] = useState(0);

    // watch for the selected tab change then move the indicator
    React.useEffect(() => {
      // Access the selected tab's HTML element and retrieve its width
      const tabWidth = tabContext?.selectedTabRef?.current?.offsetWidth || 0;
      setIndicatorWidth(tabWidth);
      setIndicatorLeftEdge(
        tabContext?.selectedTabRef?.current?.offsetLeft || 0
      );
    }, [tabContext.selectedTab, tabContext?.selectedTabRef]);

    return (
      <Tabs.List {...props} ref={forwardRef} className={tabGroupStyles.tabList}>
        {children}
        <div
          className={tabGroupStyles.indicator}
          role="presentation"
          ref={tabContext.indicatorRef}
          style={{ width: indicatorWidth, left: indicatorLeftEdge }}
        ></div>
      </Tabs.List>
    );
  }
);

type TabsTriggerPropsWithChildren = TabsTriggerProps & PropsWithChildren;

export const TabTrigger = ({
  children,
  ...props
}: TabsTriggerPropsWithChildren) => {
  const tabContext = useTabs();

  return (
    <Tabs.Trigger
      {...props}
      className={tabGroupStyles.tabItem}
      ref={
        tabContext.selectedTab === props.value
          ? tabContext.selectedTabRef
          : null
      }
    >
      {children}
    </Tabs.Trigger>
  );
};

export const TabContent = React.forwardRef<TabsElement, TabsContentProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Tabs.Content {...props} className={cardStyles.card} ref={forwardedRef}>
        {children}
      </Tabs.Content>
    );
  }
);
