import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJoinTeam } from '../hooks/queries/useQueries'; // Buat hook ini

export default function JoinTeam() {
  const { token } = useParams();
  const navigate = useNavigate();
  const join = useJoinTeam();

  useEffect(() => {
    const processJoin = async () => {
      try {
        await join.mutateAsync(token);
        alert("Berhasil bergabung!");
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
      }
    };
    processJoin();
  }, [token]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Joining Team...</h2>
        <p className="text-slate-500">Mohon tunggu sebentar, kami sedang memproses undangan Anda.</p>
      </div>
    </div>
  );
}