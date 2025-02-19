import { PlusIcon } from '@heroicons/react/solid';
import { useBridgeQuery } from '@sd/client';
import { Statistics } from '@sd/core';
import { Button, Input } from '@sd/ui';
import byteSize from 'byte-size';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import create from 'zustand';

import { AppPropsContext } from '../App';
import { Device } from '../components/device/Device';
import Dialog from '../components/layout/Dialog';

interface StatItemProps {
	name: string;

	// The raw numeric value of the stat item.
	value: string;
}

type OverviewState = {
	lastOverviewStatsSize: Record<string, number>;
	setOverviewStatsSize: (statName: string, statAmount: number) => void;
};

export const useOverviewState = create<OverviewState>((set) => ({
	lastOverviewStatsSize: {},
	setOverviewStatsSize: (statName: string, statAmount: number) =>
		set((state) => ({
			...state,
			lastOverviewStatsAmounts: { ...state.lastOverviewStatsSize, [statName]: statAmount }
		}))
}));

const StatItem: React.FC<StatItemProps> = ({ name, value: rawValue }) => {
	const itemUsedStorage = useMemo(() => {
		const size = byteSize(parseFloat(rawValue));

		if (name === 'Total capacity') console.log(size.toString());

		return {
			value: parseInt(size.value),
			unit: size.unit
		};
	}, [rawValue]);
	const appPropsContext = useContext(AppPropsContext);

	// This will flash the demo data but we should prevent that upstream instead of adding a delay here because `CountUp` doesn't have a delay.
	return (
		<div className="flex flex-col flex-shrink-0 w-32 px-4 py-3 duration-75 transform rounded-md cursor-default hover:bg-gray-50 hover:dark:bg-gray-600">
			<span className="text-sm text-gray-400">{name}</span>
			<span className="text-2xl font-bold">
				<CountUp
					end={itemUsedStorage.value}
					decimal="1"
					duration={appPropsContext?.demoMode ? 1 : 0.5}
					useEasing={true}
				/>
				<span className="ml-1 text-[16px] text-gray-400">{itemUsedStorage.unit}</span>
			</span>
		</div>
	);
};

export const OverviewScreen: React.FC<{}> = (props) => {
	const { data: libraryStatistics } = useBridgeQuery('GetLibraryStatistics');
	const { data: clientState } = useBridgeQuery('NodeGetState');

	const [stats, setStats] = useState<Statistics>(libraryStatistics || ({} as Statistics));

	// get app props context
	const appPropsContext = useContext(AppPropsContext);

	useEffect(() => {
		if (appPropsContext?.demoMode == true && !libraryStatistics?.library_db_size) {
			setStats({
				total_bytes_capacity: '8093333345230',
				preview_media_bytes: '2304387532',
				library_db_size: '83345230',
				total_file_count: 20342345,
				total_bytes_free: '89734502034',
				total_bytes_used: '8093333345230',
				total_unique_bytes: '9347397'
			});
		} else {
			setStats(libraryStatistics as Statistics);
		}
	}, [appPropsContext, libraryStatistics]);

	return (
		<div className="flex flex-col w-full h-screen overflow-x-hidden custom-scroll page-scroll">
			<div data-tauri-drag-region className="flex flex-shrink-0 w-full h-5" />
			{/* PAGE */}
			<div className="flex flex-col w-full h-screen px-3">
				{/* STAT HEADER */}
				<div className="flex w-full">
					{/* STAT CONTAINER */}
					<div className="flex pb-4 overflow-hidden">
						{stats?.total_bytes_capacity !== undefined && (
							<StatItem name="Total capacity" value={stats.total_bytes_capacity} />
						)}
						{stats?.library_db_size !== undefined && (
							<StatItem name="Index size" value={stats.library_db_size} />
						)}
						{stats?.preview_media_bytes !== undefined && (
							<StatItem name="Preview mediay" value={stats.preview_media_bytes} />
						)}
						{stats?.total_bytes_free !== undefined && (
							<StatItem name="Free space" value={stats.total_bytes_free} />
						)}
						{stats?.preview_media_bytes !== undefined && (
							<StatItem name="Total at-risk" value={stats.preview_media_bytes} />
						)}
						{/* <StatItem
              name="Total at-risk"
              value={'0'}
              unit={stats?.preview_media_bytes}
            />
            <StatItem name="Total backed up" value={'0'} unit={''} /> */}
					</div>
					<div className="flex-grow" />
					<div className="space-x-2">
						<Dialog
							title="Add Device"
							description="Connect a new device to your library. Either enter another device's code or copy this one."
							ctaAction={() => {}}
							ctaLabel="Connect"
							trigger={
								<Button
									size="sm"
									icon={<PlusIcon className="inline w-4 h-4 -mt-0.5 mr-1" />}
									variant="gray"
								>
									Add Device
								</Button>
							}
						>
							<div className="flex flex-col mt-2 space-y-3">
								<div className="flex flex-col">
									<span className="mb-1 text-xs font-bold uppercase text-gray-450">
										This Device
									</span>
									<Input readOnly disabled value="06ffd64309b24fb09e7c2188963d0207" />
								</div>
								<div className="flex flex-col">
									<span className="mb-1 text-xs font-bold uppercase text-gray-450">
										Enter a device code
									</span>
									<Input value="" />
								</div>
							</div>
						</Dialog>
					</div>
				</div>
				<div className="flex flex-col pb-4 space-y-4">
					{clientState && (
						<Device
							name={clientState?.node_name ?? 'This Device'}
							size="1.4TB"
							runningJob={{ amount: 65, task: 'Generating preview media' }}
							locations={[
								{ name: 'Pictures', folder: true },
								{ name: 'Downloads', folder: true },
								{ name: 'Minecraft', folder: true }
							]}
							type="laptop"
						/>
					)}
					<Device
						name={`James' iPhone 12`}
						size="47.7GB"
						locations={[
							{ name: 'Camera Roll', folder: true },
							{ name: 'Notes', folder: true },
							{ name: 'App.tsx', format: 'tsx', icon: 'reactts' },
							{ name: 'vite.config.js', format: 'js', icon: 'vite' }
						]}
						type="phone"
					/>
					<Device
						name={`Spacedrive Server`}
						size="5GB"
						locations={[
							{ name: 'Cached', folder: true },
							{ name: 'Photos', folder: true },
							{ name: 'Documents', folder: true }
						]}
						type="server"
					/>
				</div>
				<div className="px-5 py-3 text-sm text-gray-400 rounded-md bg-gray-50 dark:text-gray-400 dark:bg-gray-600">
					<b>Note: </b>This is a pre-alpha build of Spacedrive, many features are yet to be
					functional.
				</div>
				<div className="flex flex-shrink-0 w-full h-4" />
			</div>
		</div>
	);
};
