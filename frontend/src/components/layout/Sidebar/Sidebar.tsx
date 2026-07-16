import { SidebarHeader } from "./SidebarHeader";
import { SidebarBody } from "./SidebarBody";
import { Flex } from "@radix-ui/themes";
import { HStack } from "../Stack";
import WorkspacesSidebar from "./WorkspacesSidebar";
import AppRail from "../AppRail/AppRail";

export const Sidebar = () => {
    return (
        <HStack gap='0' className='h-screen bg-gray-2 dark:bg-gray-2'>
            <AppRail />
            <WorkspacesSidebar />
            <Flex justify='between' direction='row' width='100%' className='min-w-0'>
                <Flex direction='column' width='100%' className='min-w-0'>
                    <SidebarHeader />
                    <SidebarBody />
                </Flex>
            </Flex>
        </HStack>

    )
}
