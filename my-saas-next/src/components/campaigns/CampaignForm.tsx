'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCampaignsSchema, CreateCampaignsInput } from './campaigns.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CampaignForm({ onSubmit }: { onSubmit: (data: CreateCampaignsInput) => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(createCampaignsSchema)
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Generated Fields */}
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <Input {...register('name')} placeholder="Name" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name?.message}</p>}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Input {...register('description')} placeholder="Description" />
                {errors.description && <p className="text-red-500 text-xs">{errors.description?.message}</p>}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Input {...register('status')} placeholder="Status" />
                {errors.status && <p className="text-red-500 text-xs">{errors.status?.message}</p>}
            </div>
            
            
            <Button type="submit">Save Campaign</Button>
        </form>
    );
}
      