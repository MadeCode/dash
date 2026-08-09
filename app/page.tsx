import TaskList from '@/components/TaskList';
import HeaderClockWeather from '@/components/HeaderClockWeather';
import ScheduleList from '@/components/ScheduleList';
import FullscreenButton from '@/components/FullscreenButton';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  return (
    <main className="flex w-full h-full p-6 md:p-8 gap-6 md:gap-8 max-w-5xl mx-auto relative select-none">
      {/* Fullscreen & Settings Controls */}
      <SettingsModal />
      <FullscreenButton />

      {/* Left Column: Tasks (55%) */}
      <TaskList />

      {/* Right Column: Dashboard Data (45%) */}
      <div className="flex flex-col h-full w-[45%] border-l border-stone-200 pl-6 md:pl-8 py-2 overflow-hidden">
        {/* Top Row: Time & Date + Weather */}
        <HeaderClockWeather />

        {/* Bottom Row: Today's Schedule */}
        <ScheduleList />
      </div>
    </main>
  );
}
