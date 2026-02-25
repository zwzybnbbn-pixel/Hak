(() => {
    const SUPABASE_URL = 'https://nqothizwtmvbvyrxoguz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3RoaXp3dG12YnZ5cnhvZ3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjc2ODEsImV4cCI6MjA4MjYwMzY4MX0.Hah1FyYJT-dQI0byUO7pNKB3NZqzkyICPh_0D_zdzis';

    if (!window.farouqAppClient) {
        window.farouqAppClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    const client = window.farouqAppClient;

    window.Database = {
        // 1. جلب كل الحلقات (لصفحة الحلقات)
        async getHalaqat() {
            const { data, error } = await client.from('halaqat').select('*').order('created_at', { ascending: false });
            return error ? [] : data;
        },

        // 2. جلب حلقة واحدة بالـ ID (لصفحة تفاصيل الحلقة)
        async getHalqaById(id) {
            const { data, error } = await client.from('halaqat').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },

        // 3. جلب طلاب حلقة معينة (لصفحة تفاصيل الحلقة)
        async getStudents(halqaId = null) {
            let query = client.from('students').select('*, halaqat(title)');
            if (halqaId) query = query.eq('halqa_id', halqaId);
            const { data, error } = await query.order('name', { ascending: true });
            if (error) throw error;
            return data.map(s => ({ ...s, halqa_name: s.halaqat?.title }));
        },

        // 4. جلب طالب واحد (لصفحة تفاصيل الطالب)
        async getStudentById(id) {
            const { data, error } = await client.from('students').select('*, halaqat(title)').eq('id', id).single();
            if (error) throw error;
            return { ...data, halqa_name: data.halaqat?.title };
        },

        // 5. جلب الحضور والتقدم والسماع (لصفحة تفاصيل الطالب)
        async getAttendance(studentId) {
            const { data } = await client.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false });
            return data || [];
        },
        async getProgress(studentId) {
            const { data } = await client.from('progress').select('*').eq('student_id', studentId).order('date', { ascending: false });
            return data || [];
        },
        async getTodayListening(studentId) {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await client.from('daily_listening').select('verses_count').eq('student_id', studentId).eq('date', today).maybeSingle();
            return data?.verses_count || 0;
        },

        // 6. جلب الطالب المتميز (للصفحة الرئيسية)
        async getTopStudent() {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await client.from('daily_listening').select('verses_count, students(name, halaqat(title))').eq('date', today).order('verses_count', { ascending: false }).limit(1).maybeSingle();
            if (!data) return null;
            return { name: data.students.name, halqa: data.students.halaqat?.title, verses: data.verses_count };
        }
    };
    console.log("✅ كائن Database جاهز ويدعم جميع صفحات المشروع.");
})();
