import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../../services/projectService';
import { db } from '../../db';
import { PrivacyService } from '../../services/privacyService';

// Mock PrivacyService
vi.mock('../../services/privacyService', () => ({
    PrivacyService: {
        maskContent: vi.fn().mockResolvedValue({ maskedContent: 'Masked Desc' }),
    },
}));

// Mock DB with chaining support
const mockChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve([])), // Default resolve to empty array
};

vi.mock('../../db', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([]),
                onConflictDoNothing: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([]),
                })),
            })),
        })),
        select: vi.fn(() => mockChain),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([]),
                })),
            })),
        })),
        delete: vi.fn(() => ({
            where: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([]),
            })),
        })),
    },
}));

describe('ProjectService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain return by default
        mockChain.then = vi.fn((resolve) => resolve([]));
    });

    describe('createProject', () => {
        it('should create a project successfully', async () => {
            const mockProject = {
                id: 'proj_123',
                name: 'Test Project',
                description: 'Masked Desc',
                teamId: 'team_123',
                status: 'active',
            };

            // Mock Insert Return
            const valuesMock = vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockProject])
            });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const result = await ProjectService.createProject({
                teamId: 'team_123',
                name: 'Test Project',
                description: 'Sensitive Info', // Should be masked
            });

            expect(PrivacyService.maskContent).toHaveBeenCalledWith('team_123', 'Sensitive Info');
            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(mockProject);
        });
    });

    describe('getProjects', () => {
        it('should return projects for a team', async () => {
            const mockProjects = [
                { id: '1', name: 'P1', teamId: 't1' },
            ];

            // Mock Select Chain Return
            mockChain.then = vi.fn((resolve) => resolve(mockProjects));

            const result = await ProjectService.getProjects('t1');

            expect(db.select).toHaveBeenCalled();
            expect(mockChain.from).toHaveBeenCalled();
            expect(mockChain.where).toHaveBeenCalled();
            expect(result).toEqual(mockProjects);
        });
    });
});
