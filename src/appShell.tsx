import { Center, Flex, hope } from "@hope-ui/solid";
import { Route, Routes } from "@solidjs/router";
import { Component, lazy, Suspense } from 'solid-js';

import { Sidebar } from './components/common/sidebar';
import { LoadingSpinner } from './components/core/loading';
import { routes } from './constants/route';
import { HomePage, RedirectToHome } from "./pages/home";
import { NotFoundPage } from "./pages/notFound";

const AboutPage = lazy(() => import("./pages/about"));

export const AppShell: Component = () => {

    return (
        <Flex maxH="100vh">
            <Sidebar />
            <hope.main w="$full" px="3em" overflowY="auto" class="main">
                <Suspense fallback={
                    <Center width="100%" height="100vh">
                        <LoadingSpinner />
                    </Center>
                }>
                    <Routes>
                        <Route path={routes.about} component={AboutPage} />

                        <Route path={routes.actualHome} component={HomePage} />
                        <Route path={routes.home} component={RedirectToHome} />
                        <Route path={"*"} element={<NotFoundPage />} />
                    </Routes>

                    {/* <Footer /> */}
                </Suspense>
            </hope.main>
        </Flex>
    );
};