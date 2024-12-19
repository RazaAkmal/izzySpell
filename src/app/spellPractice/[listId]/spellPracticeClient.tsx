'use client';

import CustomPagination from '@/components/CustomPagination';
import { useRouter } from 'next/navigation';

interface ClientComponentProps {
  listId: string;
  totalPages: number;
  page: number;
}

const SpellPracticeClient: React.FC<ClientComponentProps> = ({ listId, totalPages, page }) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    const url = `/spellPractice/${listId}?page=${newPage}`;
    router.push(url); 
  };

  return (
    <CustomPagination 
      currentPage={page}
      totalPages={totalPages} 
      onPageChange={handlePageChange} 
    />
  );
}

export default SpellPracticeClient