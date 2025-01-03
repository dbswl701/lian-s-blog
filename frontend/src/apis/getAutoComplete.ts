import axios from 'axios';

export const getAutoComplete = async (value: string): Promise<string[]> => {
	const res = await axios.get('/suggest', {
		params: { q: value },
	});

	return res.data.suggestions; // 성공 시 댓글 리스트 반환
};
