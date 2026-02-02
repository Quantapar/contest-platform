export type Judge0BatchItem = {
  token: string;
};

export type Judge0BatchResponse = Judge0BatchItem[]; // Judge0 batch submission returns an array of { token }

export type Judge0SubmissionResult = {
  token: string;
  stdout: string | null;
  stderr: string | null;
  status: {
    id: Judge0StatusId;
    description: string;
  };
};

export type Judge0PollResponse = {
  submissions: Judge0SubmissionResult[];
};
export type Judge0StatusId = 1 | 2 | 3 | 4 | 5 | 6;
